import assert from "node:assert/strict";
import { test } from "node:test";

import { AGENT, COORD, api, createSubmittedPlan, markPaid, prisma, seedScenario } from "./helpers.js";

const propose = (body: Record<string, unknown>, headers = AGENT) =>
  api("POST", "/replanning/proposals", { createdBy: "Replanning Agent", ...body }, headers);
const validate = (id: string, extra: Record<string, unknown> = {}) =>
  api("POST", `/replanning/proposals/${id}/validations`, { validator: "Revalidation Agent", ...extra }, AGENT);

test("5. a supplier failure identifies the correct affected plan, purchase and NGO allocation", async () => {
  const s = await seedScenario();
  const plan = await createSubmittedPlan(s.emergency.id);

  const asAgent = await api("POST", "/supplier-failures", {
    type: "CAPACITY_REDUCED", vendorId: s.bihar.vendor.id, vendorOfferId: s.bihar.offer.id, reportedCapacity: 100,
    reason: "Warehouse flooded", isSimulation: false, reportedBy: "agent",
  }, AGENT);
  assert.equal(asAgent.status, 403, "agents cannot file real failures");

  const res = await api("POST", "/supplier-failures", {
    type: "CAPACITY_REDUCED", vendorId: s.bihar.vendor.id, vendorOfferId: s.bihar.offer.id, reportedCapacity: 100,
    reason: "Warehouse flooded", isSimulation: false, reportedBy: "Asha",
  }, COORD);
  assert.equal(res.status, 201);
  assert.equal((await prisma.vendorOffer.findUniqueOrThrow({ where: { id: s.bihar.offer.id } })).capacity, 100, "real effect applied");

  const affected = (await api("GET", `/supplier-failures/${res.body.data.event.id}/affected`)).body.data;
  assert.equal(affected.affectedPlans.length, 1);
  assert.equal(affected.affectedPlans[0].planId, plan.id);
  assert.equal(affected.affectedPlans[0].suggestedMode, "REPLACEMENT");
  assert.equal(affected.affectedPlans[0].purchases[0].affectedQuantity, 200);
  assert.equal(affected.affectedPlans[0].purchases[0].ngos[0].allocatedQuantity, 300);
});

test("simulated failures are labelled and never change stored offers", async () => {
  const s = await seedScenario();
  const res = await api("POST", "/supplier-failures", {
    type: "SUPPLIER_UNAVAILABLE", vendorId: s.bihar.vendor.id, reason: "What if Bihar goes down?", isSimulation: true, reportedBy: "agent",
  }, AGENT);
  assert.equal(res.status, 201);
  assert.equal(res.body.data.event.isSimulation, true);
  assert.equal((await prisma.vendorOffer.findUniqueOrThrow({ where: { id: s.bihar.offer.id } })).isAvailable, true);
});

test("6. replanning finds a feasible alternative; human approval commits a revision without editing the original", async () => {
  const s = await seedScenario();
  const plan = await createSubmittedPlan(s.emergency.id);
  const failure = await api("POST", "/supplier-failures", {
    type: "SUPPLIER_UNAVAILABLE", vendorId: s.bihar.vendor.id, reason: "Trucks seized", isSimulation: false, reportedBy: "Asha",
  }, COORD);
  const created = await propose({ sourcePlanId: plan.id, failureEventId: failure.body.data.event.id });
  assert.equal(created.status, 201);
  const proposal = created.body.data.proposal;
  assert.equal(proposal.mode, "REPLACEMENT");
  assert.equal(proposal.candidate.feasible, true);
  assert.equal(proposal.candidate.supplierPurchases[0].offerId, s.maharashtra.offer.id);
  assert.equal(proposal.comparison.costDelta, "4500.00");
  assert.deepEqual(proposal.comparison.suppliersRemoved, [s.bihar.vendor.name]);

  const v = await validate(proposal.id);
  assert.equal(v.body.data.outcome, "VALIDATED_WITH_WARNINGS"); // cost increase is a warning
  assert.equal((await api("POST", `/replanning/proposals/${proposal.id}/submit`, { submittedBy: "agent" }, AGENT)).status, 200);
  assert.equal((await api("POST", `/replanning/proposals/${proposal.id}/approve`, { decidedBy: "agent" }, AGENT)).status, 403);

  const approved = await api("POST", `/replanning/proposals/${proposal.id}/approve`, { decidedBy: "Asha" }, COORD);
  assert.equal(approved.status, 200);
  const committed = approved.body.data.committedPlan;
  assert.equal(committed.status, "APPROVED");
  assert.equal(committed.revisionOfId, plan.id);
  assert.equal(committed.totalCost, "54000");
  const original = await prisma.procurementPlan.findUniqueOrThrow({ where: { id: plan.id }, include: { items: { include: { purchases: true } } } });
  assert.equal(original.status, "CANCELLED");
  assert.equal(original.totalCost.toString(), "49500", "original figures preserved");
  assert.equal(original.items[0]!.purchases[0]!.vendorOfferId, s.bihar.offer.id, "original purchases preserved");
});

test("7. replanning reports infeasibility when no alternative exists, and it can never reach approval", async () => {
  const s = await seedScenario();
  const plan = await createSubmittedPlan(s.emergency.id);
  const created = await propose({
    sourcePlanId: plan.id,
    scenario: { excludeOfferIds: [s.bihar.offer.id, s.maharashtra.offer.id, s.rapid.offer.id] },
  });
  const proposal = created.body.data.proposal;
  assert.equal(proposal.isSimulation, true);
  assert.equal(proposal.candidate.feasible, false);
  assert.equal(proposal.candidate.fulfillment.unfulfilledQuantity, 300);
  const v = await validate(proposal.id);
  assert.equal(v.body.data.outcome, "REJECTED_INFEASIBLE");
  const submit = await api("POST", `/replanning/proposals/${proposal.id}/submit`, { submittedBy: "agent" }, AGENT);
  assert.equal(submit.status, 409);
});

const realReplacement = async () => {
  const s = await seedScenario();
  const plan = await createSubmittedPlan(s.emergency.id);
  const failure = await api("POST", "/supplier-failures", {
    type: "SUPPLIER_UNAVAILABLE", vendorId: s.bihar.vendor.id, reason: "Unavailable", isSimulation: false, reportedBy: "Asha",
  }, COORD);
  const proposal = (await propose({ sourcePlanId: plan.id, failureEventId: failure.body.data.event.id })).body.data.proposal;
  return { s, plan, proposal };
};

test("8. revalidation detects a changed price", async () => {
  const { s, proposal } = await realReplacement();
  await prisma.vendorOffer.update({ where: { id: s.maharashtra.offer.id }, data: { unitPrice: "185" } });
  const v = await validate(proposal.id);
  assert.equal(v.body.data.outcome, "REJECTED_STALE_DATA");
  const checks = v.body.data.report.checks.server as Array<{ code: string; status: string }>;
  assert.ok(checks.some((c) => c.code === "PRICE_UNCHANGED" && c.status === "FAIL"));
});

test("9. revalidation detects insufficient capacity", async () => {
  const { s, proposal } = await realReplacement();
  await prisma.vendorOffer.update({ where: { id: s.maharashtra.offer.id }, data: { capacity: 50 } });
  const v = await validate(proposal.id);
  assert.equal(v.body.data.outcome, "REJECTED_STALE_DATA");
  assert.ok((v.body.data.report.checks.server as Array<{ code: string; status: string }>).some((c) => c.code === "CAPACITY" && c.status === "FAIL"));
});

test("10. revalidation detects a stale plan version", async () => {
  const { plan, proposal } = await realReplacement();
  const approval = await prisma.approval.findFirstOrThrow({ where: { planId: plan.id } });
  await api("POST", `/approvals/${approval.id}/approve`, { approvedBy: "Asha" }, COORD); // bumps the plan version
  const v = await validate(proposal.id);
  assert.equal(v.body.data.outcome, "REJECTED_VERSION_CONFLICT");
});

test("11. the independent Revalidation Agent can overrule a passing candidate (escalates to human review)", async () => {
  const { proposal } = await realReplacement();
  const v = await validate(proposal.id, { agentOutcome: "REJECTED_INFEASIBLE", agentChecks: [{ code: "AGENT_CONCERN", status: "FAIL" }] });
  assert.equal(v.body.data.serverOutcome, "VALIDATED_WITH_WARNINGS");
  assert.equal(v.body.data.outcome, "REQUIRES_HUMAN_REVIEW");
});

test("12. a rejected proposal cannot be submitted or approved; approval re-validates on fresh data", async () => {
  const { s, proposal } = await realReplacement();
  await prisma.vendorOffer.update({ where: { id: s.maharashtra.offer.id }, data: { unitPrice: "200" } });
  assert.equal((await validate(proposal.id)).body.data.outcome, "REJECTED_STALE_DATA");
  assert.equal((await api("POST", `/replanning/proposals/${proposal.id}/submit`, { submittedBy: "x" }, AGENT)).status, 409);
  assert.equal((await api("POST", `/replanning/proposals/${proposal.id}/approve`, { decidedBy: "Asha" }, COORD)).body.code, "PROPOSAL_NOT_PENDING");

  // A proposal that passed earlier but went stale before approval is not committed.
  const second = await realReplacement();
  await validate(second.proposal.id);
  await api("POST", `/replanning/proposals/${second.proposal.id}/submit`, { submittedBy: "x" }, AGENT);
  await prisma.vendorOffer.update({ where: { id: second.s.maharashtra.offer.id }, data: { capacity: 10 } });
  const late = await api("POST", `/replanning/proposals/${second.proposal.id}/approve`, { decidedBy: "Asha" }, COORD);
  assert.equal(late.status, 409);
  assert.equal(late.body.code, "PROPOSAL_NO_LONGER_VALID");
  assert.equal((await prisma.procurementPlan.findUniqueOrThrow({ where: { id: second.plan.id } })).status, "PENDING_APPROVAL");
});

test("simulated proposals are compared but can never be submitted", async () => {
  const s = await seedScenario();
  const plan = await createSubmittedPlan(s.emergency.id);
  const sim = await api("POST", "/supplier-failures", { type: "SUPPLIER_UNAVAILABLE", vendorId: s.bihar.vendor.id, reason: "what if", isSimulation: true, reportedBy: "agent" }, AGENT);
  const proposal = (await propose({ sourcePlanId: plan.id, failureEventId: sim.body.data.event.id })).body.data.proposal;
  assert.equal(proposal.isSimulation, true);
  assert.equal(proposal.candidate.feasible, true);
  assert.equal((await validate(proposal.id)).body.data.outcome, "VALIDATED_WITH_WARNINGS");
  const submit = await api("POST", `/replanning/proposals/${proposal.id}/submit`, { submittedBy: "x" }, AGENT);
  assert.equal(submit.body.code, "SIMULATION_CANNOT_BE_SUBMITTED");
});

test("15. a paid plan is never modified or charged again; failures become a separate amendment", async () => {
  const s = await seedScenario();
  const plan = await createSubmittedPlan(s.emergency.id);
  const payment = await markPaid(plan.id);
  const delivery = await prisma.delivery.findFirstOrThrow({ where: { paymentId: payment.id } });

  // No evidence of failure yet → no amendment.
  assert.equal((await propose({ sourcePlanId: plan.id })).body.code, "NO_EVIDENCED_SHORTFALL");

  const failure = await api("POST", "/supplier-failures", {
    type: "ORDER_CANCELLED", vendorId: s.bihar.vendor.id, deliveryId: delivery.id, reason: "Supplier cancelled the order", isSimulation: false, reportedBy: "Asha",
  }, COORD);
  assert.equal(failure.status, 201);
  assert.equal((await prisma.delivery.findUniqueOrThrow({ where: { id: delivery.id } })).status, "FAILED");

  const created = await propose({ sourcePlanId: plan.id, failureEventId: failure.body.data.event.id, budget: 100000 });
  assert.equal(created.status, 201);
  const proposal = created.body.data.proposal;
  assert.equal(proposal.mode, "AMENDMENT");
  assert.equal(proposal.candidate.fulfillment.totalDemand, 300);
  assert.ok(!proposal.candidate.supplierPurchases.some((p: { offerId: string }) => p.offerId === s.bihar.offer.id), "failing supplier excluded");

  await validate(proposal.id);
  await api("POST", `/replanning/proposals/${proposal.id}/submit`, { submittedBy: "agent" }, AGENT);
  const approved = await api("POST", `/replanning/proposals/${proposal.id}/approve`, { decidedBy: "Asha" }, COORD);
  assert.equal(approved.status, 200);

  const original = await prisma.procurementPlan.findUniqueOrThrow({ where: { id: plan.id }, include: { payments: true } });
  assert.equal(original.totalCost.toString(), "49500");
  assert.equal(original.payments.length, 1, "no additional charge on the paid plan");
  assert.equal(original.payments[0]!.status, "COMPLETED");
  assert.equal(approved.body.data.committedPlan.revisionOfId, plan.id);
  assert.equal(approved.body.data.committedPlan.payments.length, 0, "amendment needs its own, separate payment");

  const recharge = await api("POST", `/payments/plans/${plan.id}/checkout`, {}, COORD);
  assert.equal(recharge.status, 409);
  assert.equal(recharge.body.message, "PLAN_NOT_APPROVED", "paid (ORDERED) plan cannot be checked out again");

  // The same failed delivery cannot be amended twice.
  assert.equal((await propose({ sourcePlanId: plan.id })).body.code, "NO_EVIDENCED_SHORTFALL");
});
