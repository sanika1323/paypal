/**
 * Test harness. Runs ONLY against a disposable database named by TEST_DATABASE_URL and refuses
 * any Neon host, so the production database can never be touched by tests.
 */
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after } from "node:test";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) throw new Error("Set TEST_DATABASE_URL to a disposable PostgreSQL database to run tests.");
if (/neon\.tech/i.test(testUrl)) throw new Error("Refusing to run tests against a Neon database.");
process.env.DATABASE_URL = testUrl;
process.env.RELIEFOS_COORDINATOR_TOKEN = "test-coordinator-token";
process.env.RELIEFOS_AGENT_TOKEN = "test-agent-token";
process.env.PAYPAL_RETURN_URL = "http://localhost:5173/payments/success";
process.env.PAYPAL_CANCEL_URL = "http://localhost:5173/payments/cancel";

export const { prisma } = await import("../src/config/database.js");
const { default: app } = await import("../src/app.js");

export const COORD = { Authorization: "Bearer test-coordinator-token" };
export const AGENT = { "X-Service-Token": "test-agent-token" };

let baseUrl: string | null = null;
let server: Server | null = null;
after(async () => {
  await new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve()));
  await prisma.$disconnect();
});
export const api = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
  if (!baseUrl) {
    server = app.listen(0);
    await new Promise((resolve) => server!.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  }
  const response = await fetch(`${baseUrl}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await response.json().catch(() => null)) as { success?: boolean; data?: any; code?: string; message?: string } | null;
  return { status: response.status, body: json ?? {}, headers: response.headers };
};

const uid = () => randomUUID().slice(0, 8);

/** Demo-like scenario: one emergency, two NGOs, one product, three suppliers. */
export const seedScenario = async (opts: { secondRequest?: number } = {}) => {
  const s = uid();
  const emergency = await prisma.emergency.create({ data: { name: `Flood ${s}`, location: "Nagpur, Maharashtra", severity: "HIGH" } });
  const product = await prisma.product.create({ data: { name: `Drinking Water Kit ${s}`, category: "WASH", unit: "box" } });
  const ngoA = await prisma.organization.create({ data: { name: `Relief Support ${s}`, type: "NGO", email: `a-${s}@t.org`, location: "Nagpur" } });
  const ngoB = await prisma.organization.create({ data: { name: `Second NGO ${s}`, type: "NGO", email: `b-${s}@t.org`, location: "Wardha" } });
  const vendor = async (name: string, price: string, capacity: number, days: number, reliability = 0.9) => {
    const v = await prisma.vendor.create({ data: { name: `${name} ${s}`, location: "MH", reliability } });
    const o = await prisma.vendorOffer.create({ data: { vendorId: v.id, productId: product.id, unitPrice: price, capacity, deliveryDays: days } });
    return { vendor: v, offer: o };
  };
  const maharashtra = await vendor("Maharashtra Relief Supplies", "180", 1000, 2);
  const bihar = await vendor("Bihar Emergency Traders", "165", 600, 3);
  const rapid = await vendor("Rapid Aqua Logistics", "190", 1000, 1);
  const requestA = await prisma.reliefRequest.create({ data: { organizationId: ngoA.id, emergencyId: emergency.id, productId: product.id, quantity: 300, urgency: 5 } });
  const requestB = opts.secondRequest
    ? await prisma.reliefRequest.create({ data: { organizationId: ngoB.id, emergencyId: emergency.id, productId: product.id, quantity: opts.secondRequest, urgency: 3 } })
    : null;
  return { emergency, product, ngoA, ngoB, maharashtra, bihar, rapid, requestA, requestB };
};

export const createSubmittedPlan = async (emergencyId: string, budget = 200000) => {
  const created = await api("POST", "/procurement/plans", { emergencyId, budget }, COORD);
  if (created.status !== 201) throw new Error(`plan create failed: ${JSON.stringify(created.body)}`);
  const plan = created.body.data;
  await api("POST", `/procurement/plans/${plan.id}/submit`, {}, COORD);
  return plan as { id: string; totalCost: string };
};

/** Marks a plan as paid with a captured Sandbox payment and generates its deliveries (test data only). */
export const markPaid = async (planId: string) => {
  const approval = await prisma.approval.findFirstOrThrow({ where: { planId } });
  await api("POST", `/approvals/${approval.id}/approve`, { approvedBy: "Test Coordinator" }, COORD);
  const plan = await prisma.procurementPlan.findUniqueOrThrow({ where: { id: planId } });
  const payment = await prisma.payment.create({
    data: {
      planId, amount: "527.97", currency: "USD", status: "COMPLETED", paypalOrderId: `TEST-${uid()}`, paypalCaptureId: `CAP-${uid()}`,
      originalAmountINR: plan.totalCost, exchangeRate: "0.010666", exchangeRateDate: "2026-11-11", exchangeRateProvider: "Frankfurter",
    },
  });
  const generated = await api("POST", `/deliveries/payments/${payment.id}/generate`, {}, COORD);
  if (generated.status >= 300) throw new Error(`delivery generation failed: ${JSON.stringify(generated.body)}`);
  return payment;
};
