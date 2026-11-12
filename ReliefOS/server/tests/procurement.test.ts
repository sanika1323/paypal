import assert from "node:assert/strict";
import { test } from "node:test";

import { AGENT, COORD, api, createSubmittedPlan, prisma, seedScenario } from "./helpers.js";

test("1. demand consolidation preserves source requests and flags duplicates", async () => {
  const s = await seedScenario({ secondRequest: 120 });
  const dup = await prisma.reliefRequest.create({
    data: { organizationId: s.ngoA.id, emergencyId: s.emergency.id, productId: s.product.id, quantity: 300, urgency: 5 },
  });
  const res = await api("POST", "/agents/demand", { emergencyId: s.emergency.id });
  assert.equal(res.status, 200);
  const product = res.body.data.products[0];
  assert.equal(product.totalQuantity, 720);
  const ids = product.organizations.map((o: { requestId: string }) => o.requestId).sort();
  assert.deepEqual(ids, [s.requestA.id, s.requestB!.id, dup.id].sort());
  assert.equal(res.body.data.issues.length, 1);
  assert.equal(res.body.data.issues[0].type, "DUPLICATE_REQUEST");
  const stored = await prisma.reliefRequest.findUniqueOrThrow({ where: { id: s.requestA.id } });
  assert.equal(stored.quantity, 300, "original request untouched");
  assert.equal(stored.status, "PENDING");
});

test("2. supplier comparison uses actual stored offers and reports unusable ones", async () => {
  const s = await seedScenario();
  await prisma.vendorOffer.update({ where: { id: s.rapid.offer.id }, data: { isAvailable: false } });
  const res = await api("POST", "/agents/suppliers", { emergencyId: s.emergency.id });
  assert.equal(res.status, 200);
  const offers = res.body.data.products[0].offers;
  assert.deepEqual(offers.map((o: { offerId: string }) => o.offerId), [s.bihar.offer.id, s.maharashtra.offer.id]);
  assert.equal(offers[0].unitPrice, "165.00");
  assert.equal(res.body.data.unusableOffers[0].offerId, s.rapid.offer.id);
  assert.equal(res.body.data.unusableOffers[0].state, "UNAVAILABLE");
});

test("3. optimizer respects capacity and budget (demo expectation: 300 boxes at ₹165 = ₹49,500)", async () => {
  const s = await seedScenario();
  const res = await api("POST", "/procurement/optimize", { emergencyId: s.emergency.id, budget: 200000 });
  assert.equal(res.status, 200);
  const r = res.body.data;
  assert.equal(r.estimatedCost, "49500.00");
  assert.equal(r.remainingBudget, "150500.00");
  assert.equal(r.fulfillment.fulfillmentPercentage, 100);
  assert.equal(r.supplierPurchases.length, 1);
  assert.equal(r.supplierPurchases[0].offerId, s.bihar.offer.id);

  // Capacity: 900 boxes exceed Bihar's 600, so the next-cheapest supplier covers the rest.
  await prisma.reliefRequest.update({ where: { id: s.requestA.id }, data: { quantity: 900 } });
  const big = (await api("POST", "/procurement/optimize", { emergencyId: s.emergency.id, budget: 200000 })).body.data;
  assert.deepEqual(big.supplierPurchases.map((p: { quantity: number }) => p.quantity), [600, 300]);
  assert.equal(big.estimatedCost, String((600 * 165 + 300 * 180).toFixed(2)));
});

test("4. an infeasible plan is rejected and nothing is persisted", async () => {
  const s = await seedScenario();
  const before = await prisma.procurementPlan.count({ where: { emergencyId: s.emergency.id } });
  const res = await api("POST", "/procurement/plans", { emergencyId: s.emergency.id, budget: 1000 }, COORD);
  assert.equal(res.status, 400);
  assert.match(String(res.body.message), /exceeds the available budget/);
  assert.equal(await prisma.procurementPlan.count({ where: { emergencyId: s.emergency.id } }), before);
});

test("13. approval is a human-authorized operation (agents and anonymous callers refused)", async () => {
  const s = await seedScenario();
  const plan = await createSubmittedPlan(s.emergency.id);
  const approval = await prisma.approval.findFirstOrThrow({ where: { planId: plan.id } });
  const byAgent = await api("POST", `/approvals/${approval.id}/approve`, { approvedBy: "agent" }, AGENT);
  assert.equal(byAgent.status, 403);
  assert.equal(byAgent.body.code, "FORBIDDEN_FOR_AGENTS");
  const anonymous = await api("POST", `/approvals/${approval.id}/approve`, { approvedBy: "x" });
  assert.equal(anonymous.status, 401);
  assert.equal((await prisma.procurementPlan.findUniqueOrThrow({ where: { id: plan.id } })).status, "PENDING_APPROVAL");
  const human = await api("POST", `/approvals/${approval.id}/approve`, { approvedBy: "Asha" }, COORD);
  assert.equal(human.status, 200);
  assert.equal((await prisma.procurementPlan.findUniqueOrThrow({ where: { id: plan.id } })).status, "APPROVED");
});

test("14. retrying a write with the same Idempotency-Key creates exactly one record", async () => {
  const s = await seedScenario();
  const headers = { ...AGENT, "Idempotency-Key": `plan-${s.emergency.id}` };
  const first = await api("POST", "/procurement/plans", { emergencyId: s.emergency.id, budget: 200000 }, headers);
  assert.equal(first.status, 201);
  const retry = await api("POST", "/procurement/plans", { emergencyId: s.emergency.id, budget: 200000 }, headers);
  assert.equal(retry.status, 201);
  assert.equal(retry.headers.get("idempotent-replayed"), "true");
  assert.equal(retry.body.data.id, first.body.data.id);
  assert.equal(await prisma.procurementPlan.count({ where: { emergencyId: s.emergency.id } }), 1);
  const misuse = await api("POST", "/procurement/plans", { emergencyId: s.emergency.id, budget: 199999 }, headers);
  assert.equal(misuse.status, 409);
  assert.equal(misuse.body.code, "IDEMPOTENCY_KEY_REUSED");
});

test("catalog writes require a coordinator; agents cannot invent supplier data", async () => {
  const s = await seedScenario();
  const res = await api("PATCH", `/vendor-offers/${s.bihar.offer.id}`, { capacity: 5000 }, AGENT);
  assert.equal(res.status, 403);
  assert.equal((await prisma.vendorOffer.findUniqueOrThrow({ where: { id: s.bihar.offer.id } })).capacity, 600);
});
