import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";

/**
 * Delivery generation and tracking.
 *
 * When a payment is captured, each plan item's supplier purchases are matched to
 * its NGO allocations (greedy, in stored order), producing one Delivery per
 * supplier → NGO shipment. Quantities always sum to the purchased quantities.
 */

type DeliveryStatus = "PENDING" | "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "DELAYED" | "FAILED";

// Status changes a coordinator may make directly. DELIVERED is reachable only through
// confirmDeliveryReceipt, which records who received how much.
const TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  PENDING: ["DISPATCHED", "DELAYED", "FAILED"],
  DISPATCHED: ["IN_TRANSIT", "DELAYED", "FAILED"],
  IN_TRANSIT: ["DELAYED", "FAILED"],
  DELAYED: ["DISPATCHED", "IN_TRANSIT", "FAILED"],
  DELIVERED: [],
  FAILED: [],
};
const RECEIVABLE: DeliveryStatus[] = ["DISPATCHED", "IN_TRANSIT", "DELAYED"];

const DAY_MS = 24 * 60 * 60 * 1000;

export const deliveryInclude = {
  procurementPurchase: {
    include: {
      vendorOffer: { include: { vendor: true, product: true } },
      planItem: { select: { id: true, planId: true, unit: true } },
    },
  },
  allocation: { include: { organization: true } },
  payment: {
    select: {
      id: true, planId: true, status: true, paypalOrderId: true, paypalCaptureId: true,
      plan: { select: { id: true, name: true, status: true, emergencyId: true, emergency: { select: { name: true } } } },
    },
  },
  failureEvents: { select: { id: true, type: true, isSimulation: true, reason: true, createdAt: true } },
} as const;

export const generateDeliveriesForPayment = async (paymentId: string) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        deliveries: true,
        plan: {
          include: {
            items: {
              orderBy: { createdAt: "asc" },
              include: {
                purchases: { orderBy: { createdAt: "asc" } },
                allocations: { orderBy: { id: "asc" }, include: { organization: true } },
              },
            },
          },
        },
      },
    });

    if (!payment) throw new Error("PAYMENT_NOT_FOUND");
    if (payment.status !== "COMPLETED") throw new Error("PAYMENT_NOT_COMPLETED");

    // Idempotent: a captured payment generates its deliveries exactly once.
    if (payment.deliveries.length > 0) {
      return { created: false, count: payment.deliveries.length };
    }

    const baseTime = payment.updatedAt.getTime();
    const prefix = payment.planId.slice(-6).toUpperCase();
    let sequence = 0;
    const rows: Array<{
      paymentId: string;
      procurementPurchaseId: string;
      allocationId: string;
      trackingRef: string;
      destination: string;
      quantity: number;
      estimatedAt: Date;
    }> = [];

    for (const item of payment.plan.items) {
      const purchases = item.purchases.map((p) => ({ ...p, remaining: p.quantity }));
      const allocations = item.allocations
        .filter((a) => a.quantity > 0)
        .map((a) => ({ ...a, remaining: a.quantity }));

      let pi = 0;
      let ai = 0;
      while (pi < purchases.length && ai < allocations.length) {
        const purchase = purchases[pi]!;
        const allocation = allocations[ai]!;
        const quantity = Math.min(purchase.remaining, allocation.remaining);

        if (quantity > 0) {
          sequence += 1;
          rows.push({
            paymentId: payment.id,
            procurementPurchaseId: purchase.id,
            allocationId: allocation.id,
            trackingRef: `RLF-${prefix}-${String(sequence).padStart(3, "0")}`,
            destination: allocation.organization.location
              ? `${allocation.organization.name}, ${allocation.organization.location}`
              : allocation.organization.name,
            quantity,
            estimatedAt: new Date(baseTime + purchase.deliveryDays * DAY_MS),
          });
        }

        purchase.remaining -= quantity;
        allocation.remaining -= quantity;
        if (purchase.remaining === 0) pi += 1;
        if (allocation.remaining === 0) ai += 1;
      }
    }

    if (rows.length === 0) throw new Error("NO_DELIVERABLE_ALLOCATIONS");

    await tx.delivery.createMany({ data: rows });

    await tx.procurementPlan.update({
      where: { id: payment.planId },
      data: { version: { increment: 1 }, status: "ORDERED" },
    });

    // Paid demand is no longer eligible for new plans.
    const requestIds = payment.plan.items
      .flatMap((item) => item.allocations.map((a) => a.reliefRequestId))
      .filter((id): id is string => Boolean(id));
    if (requestIds.length > 0) {
      await tx.reliefRequest.updateMany({
        where: { id: { in: requestIds }, status: { in: ["PENDING", "VERIFIED", "CONSOLIDATED"] } },
        data: { status: "APPROVED" },
      });
    }

    await tx.auditLog.create({
      data: {
        action: "DELIVERIES_GENERATED",
        entityType: "ProcurementPlan",
        entityId: payment.planId,
        details: {
          paymentId: payment.id,
          deliveryCount: rows.length,
          totalQuantity: rows.reduce((sum, row) => sum + row.quantity, 0),
          trackingRefs: rows.map((row) => row.trackingRef),
        },
      },
    });

    return { created: true, count: rows.length };
  });
};

/** Generate deliveries after a capture without failing the capture itself. */
export const generateDeliveriesSafely = async (paymentId: string) => {
  try {
    return await generateDeliveriesForPayment(paymentId);
  } catch (error) {
    console.error("Delivery generation failed:", error);
    await prisma.auditLog
      .create({
        data: {
          action: "DELIVERY_GENERATION_FAILED",
          entityType: "Payment",
          entityId: paymentId,
          details: { reason: error instanceof Error ? error.message : "UNKNOWN_ERROR" },
        },
      })
      .catch(() => undefined);
    return null;
  }
};

export const listDeliveries = async (filters: { planId?: string; status?: DeliveryStatus }) => {
  return prisma.delivery.findMany({
    where: {
      ...(filters.planId && { payment: { planId: filters.planId } }),
      ...(filters.status && { status: filters.status }),
    },
    orderBy: [{ createdAt: "desc" }, { trackingRef: "asc" }],
    include: deliveryInclude,
  });
};

export const updateDeliveryStatus = async (input: {
  deliveryId: string;
  status: DeliveryStatus;
  reason?: string;
  dispatchedQuantity?: number;
  updatedBy: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({ where: { id: input.deliveryId }, include: { payment: true } });
    if (!delivery) throw new Error("DELIVERY_NOT_FOUND");

    const current = delivery.status as DeliveryStatus;
    if (!TRANSITIONS[current].includes(input.status)) throw new Error("INVALID_DELIVERY_TRANSITION");
    const reason = input.reason?.trim();
    if ((input.status === "FAILED" || input.status === "DELAYED") && !reason) throw new Error("REASON_REQUIRED");

    let dispatchedQuantity = delivery.dispatchedQuantity;
    if (input.status === "DISPATCHED") {
      dispatchedQuantity = input.dispatchedQuantity ?? delivery.quantity;
      if (!Number.isInteger(dispatchedQuantity) || dispatchedQuantity <= 0 || dispatchedQuantity > delivery.quantity) {
        throw new Error("INVALID_DISPATCHED_QUANTITY");
      }
    }

    const updated = await tx.delivery.update({
      where: { id: delivery.id },
      data: {
        status: input.status,
        dispatchedQuantity,
        failureReason: input.status === "FAILED" ? reason : undefined,
        delayReason: input.status === "DELAYED" ? reason : undefined,
      },
      include: deliveryInclude,
    });

    await tx.auditLog.create({
      data: {
        action: `DELIVERY_${input.status}`,
        entityType: "Delivery",
        entityId: delivery.id,
        details: {
          trackingRef: delivery.trackingRef,
          previousStatus: current,
          newStatus: input.status,
          quantity: delivery.quantity,
          dispatchedQuantity,
          destination: delivery.destination,
          reason: reason ?? null,
          updatedBy: input.updatedBy,
        },
      },
    });

    const planCompleted = input.status === "FAILED" && delivery.payment ? await closePlanIfSettled(tx, delivery.payment.planId) : false;
    return { delivery: updated, planCompleted };
  });
};

/** NGO receipt: the only way a delivery becomes DELIVERED. Records receiver and received quantity. */
export const confirmDeliveryReceipt = async (input: {
  deliveryId: string;
  receivedBy: string;
  deliveredQuantity: number;
  notes?: string;
  confirmedBy: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({ where: { id: input.deliveryId }, include: { payment: true } });
    if (!delivery) throw new Error("DELIVERY_NOT_FOUND");
    if (!RECEIVABLE.includes(delivery.status as DeliveryStatus)) throw new Error("DELIVERY_NOT_IN_TRANSIT");
    const limit = delivery.dispatchedQuantity || delivery.quantity;
    if (!Number.isInteger(input.deliveredQuantity) || input.deliveredQuantity < 0 || input.deliveredQuantity > limit) {
      throw new Error("INVALID_DELIVERED_QUANTITY");
    }
    if (!input.receivedBy.trim()) throw new Error("RECEIVER_REQUIRED");

    const now = new Date();
    const updated = await tx.delivery.update({
      where: { id: delivery.id },
      data: {
        status: "DELIVERED",
        deliveredQuantity: input.deliveredQuantity,
        receivedBy: input.receivedBy.trim(),
        receivedAt: now,
        deliveredAt: now,
        receiptNotes: input.notes?.trim() || null,
      },
      include: deliveryInclude,
    });

    const shortfall = delivery.quantity - input.deliveredQuantity;
    await tx.auditLog.create({
      data: {
        action: shortfall > 0 ? "DELIVERY_RECEIVED_SHORT" : "DELIVERY_RECEIVED",
        entityType: "Delivery",
        entityId: delivery.id,
        details: {
          trackingRef: delivery.trackingRef,
          quantity: delivery.quantity,
          deliveredQuantity: input.deliveredQuantity,
          shortfall,
          receivedBy: input.receivedBy.trim(),
          confirmedBy: input.confirmedBy,
          notes: input.notes?.trim() || null,
        },
      },
    });

    const planCompleted = delivery.payment ? await closePlanIfSettled(tx, delivery.payment.planId) : false;
    return { delivery: updated, planCompleted, shortfall };
  });
};

/**
 * Once no shipment of a plan is still moving, the plan is COMPLETED. A relief request becomes
 * FULFILLED only if every shipment towards it was received in full.
 */
const closePlanIfSettled = async (tx: Prisma.TransactionClient, planId: string) => {
  const active = await tx.delivery.count({
    where: { payment: { planId }, status: { in: ["PENDING", "DISPATCHED", "IN_TRANSIT", "DELAYED"] } },
  });
  if (active > 0) return false;

  const all = await tx.delivery.findMany({
    where: { payment: { planId } },
    select: { status: true, quantity: true, deliveredQuantity: true, allocation: { select: { reliefRequestId: true } } },
  });
  const byRequest = new Map<string, boolean>();
  for (const row of all) {
    const requestId = row.allocation?.reliefRequestId;
    if (!requestId) continue;
    const full = row.status === "DELIVERED" && row.deliveredQuantity === row.quantity;
    byRequest.set(requestId, (byRequest.get(requestId) ?? true) && full);
  }
  const fulfilled = [...byRequest].filter(([, ok]) => ok).map(([id]) => id);
  if (fulfilled.length) {
    await tx.reliefRequest.updateMany({ where: { id: { in: fulfilled } }, data: { status: "FULFILLED" } });
  }
  await tx.procurementPlan.update({ where: { id: planId }, data: { version: { increment: 1 }, status: "COMPLETED" } });
  await tx.auditLog.create({
    data: {
      action: "PROCUREMENT_PLAN_COMPLETED",
      entityType: "ProcurementPlan",
      entityId: planId,
      details: {
        deliveries: all.length,
        receivedInFull: all.filter((d) => d.status === "DELIVERED" && d.deliveredQuantity === d.quantity).length,
        failed: all.filter((d) => d.status === "FAILED").length,
        shortDelivered: all.filter((d) => d.status === "DELIVERED" && d.deliveredQuantity < d.quantity).length,
        fulfilledRequests: fulfilled.length,
      },
    },
  });
  return true;
};
