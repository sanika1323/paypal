import assert from "node:assert/strict";
import { test } from "node:test";

import { AGENT, COORD, api, createSubmittedPlan, markPaid, prisma, seedScenario } from "./helpers.js";

test("16. payment verification reports PayPal's own result and rejects mismatching orders", async () => {
  process.env.PAYPAL_CLIENT_ID = "test";
  process.env.PAYPAL_CLIENT_SECRET = "test";
  process.env.PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";
  const s = await seedScenario();
  const plan = await createSubmittedPlan(s.emergency.id);
  const approval = await prisma.approval.findFirstOrThrow({ where: { planId: plan.id } });
  await api("POST", `/approvals/${approval.id}/approve`, { approvedBy: "Asha" }, COORD);
  const payment = await prisma.payment.create({
    data: { planId: plan.id, amount: "527.97", currency: "USD", status: "PENDING", paypalOrderId: `ORDER-${plan.id}`, originalAmountINR: "49500" },
  });

  // Intercept only PayPal: the provider answer is what the API must report.
  let orderAmount = "527.97";
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.includes("/v1/oauth2/token")) return new Response(JSON.stringify({ access_token: "t" }), { status: 200 });
    if (url.includes("/v2/checkout/orders/")) {
      return new Response(JSON.stringify({
        id: payment.paypalOrderId, status: "APPROVED",
        purchase_units: [{ reference_id: plan.id, custom_id: payment.id, amount: { currency_code: "USD", value: orderAmount } }],
      }), { status: 200 });
    }
    return realFetch(input, init);
  }) as typeof fetch;

  try {
    const ok = await api("GET", `/payments/${payment.id}/verify-paypal-order`);
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.paypalOrderStatus, "APPROVED");
    assert.equal(ok.body.data.captured, false, "approved at PayPal is not captured");
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })).status, "PENDING");

    orderAmount = "1.00";
    const mismatch = await api("GET", `/payments/${payment.id}/verify-paypal-order`);
    assert.equal(mismatch.status, 409);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("17. delivery completion requires a persisted NGO receipt", async () => {
  const s = await seedScenario({ secondRequest: 100 });
  const plan = await createSubmittedPlan(s.emergency.id);
  const payment = await markPaid(plan.id);
  const deliveries = await prisma.delivery.findMany({ where: { paymentId: payment.id }, orderBy: { trackingRef: "asc" } });
  assert.equal(deliveries.reduce((sum, d) => sum + d.quantity, 0), 400);
  assert.ok(deliveries.every((d) => d.status === "PENDING" && d.dispatchedQuantity === 0), "payment does not imply dispatch");

  const [a, b] = deliveries as [typeof deliveries[0], typeof deliveries[0]];
  const direct = await api("PATCH", `/deliveries/${a.id}/status`, { status: "DELIVERED", updatedBy: "Asha" }, COORD);
  assert.equal(direct.status, 400, "DELIVERED cannot be set directly");
  const early = await api("POST", `/deliveries/${a.id}/receipt`, { receivedBy: "NGO desk", deliveredQuantity: a.quantity, confirmedBy: "Asha" }, COORD);
  assert.equal(early.body.code, "DELIVERY_NOT_IN_TRANSIT");
  assert.equal((await api("PATCH", `/deliveries/${a.id}/status`, { status: "DISPATCHED", updatedBy: "agent" }, AGENT)).status, 403);

  for (const d of [a, b]) await api("PATCH", `/deliveries/${d.id}/status`, { status: "DISPATCHED", updatedBy: "Asha" }, COORD);
  assert.equal((await api("PATCH", `/deliveries/${a.id}/status`, { status: "DELAYED", updatedBy: "Asha" }, COORD)).body.code, "REASON_REQUIRED");

  const full = await api("POST", `/deliveries/${a.id}/receipt`, { receivedBy: "Relief desk", deliveredQuantity: a.quantity, confirmedBy: "Asha" }, COORD);
  assert.equal(full.status, 200);
  assert.equal(full.body.data.planCompleted, false);
  const short = await api("POST", `/deliveries/${b.id}/receipt`, { receivedBy: "Store", deliveredQuantity: b.quantity - 20, confirmedBy: "Asha" }, COORD);
  assert.equal(short.body.data.shortfall, 20);
  assert.equal(short.body.data.planCompleted, true);

  const fullRequestId = a.allocationId ? (await prisma.allocation.findUniqueOrThrow({ where: { id: a.allocationId } })).reliefRequestId : null;
  const shortRequestId = b.allocationId ? (await prisma.allocation.findUniqueOrThrow({ where: { id: b.allocationId } })).reliefRequestId : null;
  assert.equal((await prisma.reliefRequest.findUniqueOrThrow({ where: { id: fullRequestId! } })).status, "FULFILLED");
  assert.notEqual((await prisma.reliefRequest.findUniqueOrThrow({ where: { id: shortRequestId! } })).status, "FULFILLED", "short delivery is not fulfilment");

  const timeline = await api("GET", `/deliveries/${b.id}`);
  assert.deepEqual(
    timeline.body.data.timeline.map((t: { action: string }) => t.action),
    ["DELIVERY_DISPATCHED", "DELIVERY_RECEIVED_SHORT"]
  );
});

test("agent workflows record ordered steps and reject unauthenticated writes", async () => {
  const wf = await api("POST", "/agent-workflows", { type: "PROCUREMENT", trigger: "test", state: { step: "start" } }, AGENT);
  assert.equal(wf.status, 201);
  for (const agent of ["DEMAND_AGENT", "SUPPLIER_AGENT"]) {
    const step = await api("POST", `/agent-workflows/${wf.body.data.id}/steps`, {
      agent, kind: "MCP_TOOL", tool: "x", status: "COMPLETED", startedAt: new Date().toISOString(), durationMs: 5,
    }, AGENT);
    assert.equal(step.status, 201);
  }
  const loaded = await api("GET", `/agent-workflows/${wf.body.data.id}`);
  assert.deepEqual(loaded.body.data.steps.map((s: { sequence: number }) => s.sequence), [1, 2]);
  assert.equal((await api("POST", "/agent-workflows", { type: "X", trigger: "x", state: {} })).status, 401);
});
