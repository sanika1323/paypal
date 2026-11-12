import type { Request, Response } from "express";

import { prisma } from "../config/database.js";
import { sendError } from "../utils/http.js";

/** Read-only aggregates derived from persisted records (no estimates). */

export const supplierRiskController = async (_req: Request, res: Response) => {
  try {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const vendors = await prisma.vendor.findMany({
      include: {
        offers: { include: { product: { select: { name: true } }, purchases: { include: { deliveries: true } } } },
        failureEvents: { select: { isSimulation: true, createdAt: true, type: true } },
      },
      orderBy: { name: "asc" },
    });
    const now = Date.now();
    const data = vendors.map((v) => {
      const realFailures = v.failureEvents.filter((f) => !f.isSimulation);
      const recent = realFailures.filter((f) => f.createdAt >= since).length;
      const deliveries = v.offers.flatMap((o) => o.purchases.flatMap((p) => p.deliveries));
      const received = deliveries.filter((d) => d.status === "DELIVERED");
      const onTime = received.filter((d) => d.deliveredAt && d.estimatedAt && d.deliveredAt <= d.estimatedAt).length;
      const rated = v.reliability > 0;
      const failurePart = Math.min(recent, 5) / 5;
      const riskScore = Number((rated ? 0.6 * (1 - Math.min(1, v.reliability)) + 0.4 * failurePart : failurePart).toFixed(3));
      return {
        vendorId: v.id,
        vendorName: v.name,
        location: v.location,
        latitude: v.latitude,
        longitude: v.longitude,
        reliability: v.reliability,
        reliabilityRated: rated,
        offers: v.offers.length,
        usableOffers: v.offers.filter((o) => o.isAvailable && o.capacity > 0 && (!o.validUntil || o.validUntil.getTime() >= now)).length,
        totalCapacity: v.offers.reduce((s, o) => s + o.capacity, 0),
        products: [...new Set(v.offers.map((o) => o.product.name))],
        purchasedQuantity: v.offers.reduce((s, o) => s + o.purchases.reduce((a, p) => a + p.quantity, 0), 0),
        realFailures: realFailures.length,
        recentRealFailures: recent,
        simulatedFailures: v.failureEvents.length - realFailures.length,
        deliveries: deliveries.length,
        deliveredOnTime: onTime,
        receivedDeliveries: received.length,
        riskScore,
        riskLevel: riskScore >= 0.5 ? "HIGH" : riskScore >= 0.25 ? "MEDIUM" : "LOW",
      };
    });
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return sendError(res, error, "Failed to compute supplier risk metrics");
  }
};

export const procurementAnalyticsController = async (_req: Request, res: Response) => {
  try {
    const [plans, deliveries, requests, proposals] = await Promise.all([
      prisma.procurementPlan.findMany({ select: { status: true, totalBudget: true, totalCost: true, payments: { select: { status: true } } } }),
      prisma.delivery.findMany({ select: { status: true, quantity: true, dispatchedQuantity: true, deliveredQuantity: true } }),
      prisma.reliefRequest.findMany({ select: { status: true, quantity: true } }),
      prisma.replanningProposal.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    const byStatus = <T extends { status: string }>(rows: T[]) =>
      rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});
    const committed = plans.filter((p) => ["APPROVED", "ORDERED", "COMPLETED"].includes(p.status));
    return res.json({
      success: true,
      data: {
        plansByStatus: byStatus(plans),
        committedSpendINR: committed.reduce((s, p) => s + Number(p.totalCost), 0).toFixed(2),
        committedBudgetINR: committed.reduce((s, p) => s + Number(p.totalBudget), 0).toFixed(2),
        capturedPayments: plans.flatMap((p) => p.payments).filter((p) => p.status === "COMPLETED").length,
        requestsByStatus: byStatus(requests),
        requestedUnits: requests.reduce((s, r) => s + r.quantity, 0),
        deliveriesByStatus: byStatus(deliveries),
        unitsShipped: deliveries.reduce((s, d) => s + d.quantity, 0),
        unitsDispatched: deliveries.reduce((s, d) => s + d.dispatchedQuantity, 0),
        unitsDelivered: deliveries.reduce((s, d) => s + d.deliveredQuantity, 0),
        proposalsByStatus: Object.fromEntries(proposals.map((p) => [p.status, p._count._all])),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return sendError(res, error, "Failed to compute procurement analytics");
  }
};
