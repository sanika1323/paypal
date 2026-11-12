import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";

export type FailureType =
  | "ORDER_CANCELLED"
  | "INSUFFICIENT_STOCK"
  | "CAPACITY_REDUCED"
  | "SUPPLIER_UNAVAILABLE"
  | "OFFER_EXPIRED"
  | "PRICE_CHANGED"
  | "DELIVERY_DELAYED"
  | "WHAT_IF_SCENARIO";

export type ReportFailureInput = {
  type: FailureType;
  vendorId: string;
  vendorOfferId?: string;
  planId?: string;
  deliveryId?: string;
  affectedQuantity?: number;
  reportedCapacity?: number;
  reportedUnitPrice?: string;
  reportedDeliveryDays?: number;
  reason: string;
  isSimulation: boolean;
  reportedBy: string;
  idempotencyKey?: string;
};

const ACTIVE_DELIVERY = ["PENDING", "DISPATCHED", "IN_TRANSIT", "DELAYED"] as const;
const LIVE_PLAN = ["DRAFT", "ANALYZING", "PENDING_APPROVAL", "APPROVED", "ORDERED", "COMPLETED"] as const;

/**
 * Persist a supplier failure. A REAL report (coordinator only) applies its effect to the stored
 * offer or delivery in the same transaction. A SIMULATION is recorded and labelled, and changes
 * nothing else: its effect is applied only in memory when a proposal is generated from it.
 */
export const reportSupplierFailure = async (input: ReportFailureInput, actor: "coordinator" | "agent") => {
  if (actor === "agent" && !input.isSimulation) throw new Error("AGENTS_MAY_ONLY_SIMULATE");
  if (input.type === "WHAT_IF_SCENARIO" && !input.isSimulation) throw new Error("WHAT_IF_MUST_BE_SIMULATION");

  if (input.idempotencyKey) {
    const existing = await prisma.supplierFailureEvent.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return { event: existing, effects: [] as string[], replayed: true };
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId }, include: { offers: true } });
  if (!vendor) throw new Error("VENDOR_NOT_FOUND");

  const offer = input.vendorOfferId ? vendor.offers.find((o) => o.id === input.vendorOfferId) : undefined;
  if (input.vendorOfferId && !offer) throw new Error("OFFER_NOT_FROM_VENDOR");

  if (input.planId && !(await prisma.procurementPlan.findUnique({ where: { id: input.planId } }))) {
    throw new Error("PLAN_NOT_FOUND");
  }

  const delivery = input.deliveryId
    ? await prisma.delivery.findUnique({
        where: { id: input.deliveryId },
        include: { procurementPurchase: { include: { vendorOffer: true } } },
      })
    : null;
  if (input.deliveryId && !delivery) throw new Error("DELIVERY_NOT_FOUND");
  if (delivery && delivery.procurementPurchase?.vendorOffer.vendorId !== vendor.id) {
    throw new Error("DELIVERY_NOT_FROM_VENDOR");
  }

  const needsOffer = ["CAPACITY_REDUCED", "INSUFFICIENT_STOCK", "PRICE_CHANGED"].includes(input.type);
  if (needsOffer && !offer) throw new Error("OFFER_REQUIRED_FOR_THIS_FAILURE");
  if ((input.type === "CAPACITY_REDUCED" || input.type === "INSUFFICIENT_STOCK") && input.reportedCapacity === undefined) {
    throw new Error("REPORTED_CAPACITY_REQUIRED");
  }
  if (input.type === "PRICE_CHANGED" && !input.reportedUnitPrice) throw new Error("REPORTED_PRICE_REQUIRED");
  if (input.type === "DELIVERY_DELAYED" && !delivery) throw new Error("DELIVERY_REQUIRED_FOR_DELAY");

  return prisma.$transaction(async (tx) => {
    const event = await tx.supplierFailureEvent.create({
      data: {
        type: input.type,
        vendorId: input.vendorId,
        vendorOfferId: input.vendorOfferId,
        planId: input.planId,
        deliveryId: input.deliveryId,
        affectedQuantity: input.affectedQuantity,
        reportedCapacity: input.reportedCapacity,
        reportedUnitPrice: input.reportedUnitPrice,
        reportedDeliveryDays: input.reportedDeliveryDays,
        reason: input.reason,
        isSimulation: input.isSimulation,
        reportedBy: input.reportedBy,
        idempotencyKey: input.idempotencyKey,
      },
    });

    const effects: string[] = [];
    if (!input.isSimulation) {
      const offerIds = offer ? [offer.id] : vendor.offers.map((o) => o.id);
      switch (input.type) {
        case "CAPACITY_REDUCED":
        case "INSUFFICIENT_STOCK":
          await tx.vendorOffer.update({ where: { id: offer!.id }, data: { capacity: input.reportedCapacity! } });
          effects.push(`Offer ${offer!.id} capacity ${offer!.capacity} → ${input.reportedCapacity}`);
          break;
        case "PRICE_CHANGED":
          await tx.vendorOffer.update({ where: { id: offer!.id }, data: { unitPrice: input.reportedUnitPrice! } });
          effects.push(`Offer ${offer!.id} unit price ${offer!.unitPrice.toString()} → ${input.reportedUnitPrice}`);
          break;
        case "SUPPLIER_UNAVAILABLE":
        case "ORDER_CANCELLED":
          await tx.vendorOffer.updateMany({ where: { id: { in: offerIds } }, data: { isAvailable: false } });
          effects.push(`${offerIds.length} offer(s) marked unavailable`);
          break;
        case "OFFER_EXPIRED":
          await tx.vendorOffer.updateMany({ where: { id: { in: offerIds } }, data: { validUntil: new Date() } });
          effects.push(`${offerIds.length} offer(s) expired`);
          break;
        default:
          break;
      }

      if (delivery && (ACTIVE_DELIVERY as readonly string[]).includes(delivery.status)) {
        if (input.type === "DELIVERY_DELAYED") {
          await tx.delivery.update({
            where: { id: delivery.id },
            data: { status: "DELAYED", delayReason: input.reason },
          });
          effects.push(`Delivery ${delivery.trackingRef ?? delivery.id} marked DELAYED`);
        } else if (["ORDER_CANCELLED", "SUPPLIER_UNAVAILABLE", "INSUFFICIENT_STOCK"].includes(input.type)) {
          await tx.delivery.update({
            where: { id: delivery.id },
            data: { status: "FAILED", failureReason: `${input.type}: ${input.reason}` },
          });
          effects.push(`Delivery ${delivery.trackingRef ?? delivery.id} marked FAILED`);
        }
      }
    }

    await tx.auditLog.create({
      data: {
        action: input.isSimulation ? "SUPPLIER_FAILURE_SIMULATED" : "SUPPLIER_FAILURE_REPORTED",
        entityType: "SupplierFailureEvent",
        entityId: event.id,
        details: {
          type: input.type,
          vendorId: input.vendorId,
          vendorOfferId: input.vendorOfferId ?? null,
          planId: input.planId ?? null,
          deliveryId: input.deliveryId ?? null,
          reason: input.reason,
          reportedBy: input.reportedBy,
          isSimulation: input.isSimulation,
          effects,
        } as Prisma.InputJsonObject,
      },
    });

    return { event, effects, replayed: false };
  });
};

export const listSupplierFailures = async (filters: { vendorId?: string; planId?: string }) =>
  prisma.supplierFailureEvent.findMany({
    where: { ...(filters.vendorId && { vendorId: filters.vendorId }), ...(filters.planId && { planId: filters.planId }) },
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true, location: true } },
      vendorOffer: { include: { product: { select: { id: true, name: true, unit: true } } } },
      plan: { select: { id: true, name: true, status: true, version: true } },
      delivery: { select: { id: true, trackingRef: true, status: true, quantity: true } },
      proposals: { select: { id: true, status: true, mode: true, createdAt: true } },
    },
  });

/** Plans, purchases, NGO allocations and deliveries touched by a failure event. Read-only. */
export const getAffectedRecords = async (eventId: string) => {
  const event = await prisma.supplierFailureEvent.findUnique({
    where: { id: eventId },
    include: { vendor: { include: { offers: true } }, vendorOffer: true },
  });
  if (!event) throw new Error("FAILURE_EVENT_NOT_FOUND");

  const offerIds = event.vendorOfferId ? [event.vendorOfferId] : event.vendor.offers.map((o) => o.id);
  const purchases = await prisma.procurementPurchase.findMany({
    where: {
      vendorOfferId: { in: offerIds },
      planItem: { plan: { status: { in: [...LIVE_PLAN] }, ...(event.planId && { id: event.planId }) } },
      ...(event.deliveryId && { deliveries: { some: { id: event.deliveryId } } }),
    },
    include: {
      vendorOffer: { include: { vendor: true, product: true } },
      deliveries: true,
      planItem: {
        include: {
          plan: { include: { payments: true } },
          allocations: { include: { organization: true } },
        },
      },
    },
  });

  const plans = new Map<string, {
    planId: string; planName: string; status: string; version: number; paid: boolean;
    suggestedMode: "REPLACEMENT" | "AMENDMENT"; purchases: unknown[]; affectedQuantity: number;
  }>();

  for (const purchase of purchases) {
    const plan = purchase.planItem.plan;
    const paid = plan.payments.some((p) => p.status === "COMPLETED");
    const undelivered = purchase.deliveries.reduce((sum, d) => sum + (d.quantity - d.deliveredQuantity), 0);
    const failedOrShort = purchase.deliveries
      .filter((d) => d.status === "FAILED" || (d.status === "DELIVERED" && d.deliveredQuantity < d.quantity))
      .reduce((sum, d) => sum + (d.quantity - d.deliveredQuantity), 0);

    let affected = purchase.quantity;
    if (event.type === "CAPACITY_REDUCED" || event.type === "INSUFFICIENT_STOCK") {
      affected = Math.max(0, purchase.quantity - (event.reportedCapacity ?? purchase.quantity));
    }
    if (paid) affected = event.deliveryId ? failedOrShort || undelivered : failedOrShort;
    if (event.affectedQuantity !== null) affected = Math.min(affected || event.affectedQuantity, event.affectedQuantity);

    const entry = plans.get(plan.id) ?? {
      planId: plan.id, planName: plan.name, status: plan.status, version: plan.version, paid,
      suggestedMode: paid ? "AMENDMENT" : "REPLACEMENT", purchases: [], affectedQuantity: 0,
    };
    entry.purchases.push({
      purchaseId: purchase.id,
      offerId: purchase.vendorOfferId,
      vendorName: purchase.vendorOffer.vendor.name,
      productName: purchase.vendorOffer.product.name,
      plannedQuantity: purchase.quantity,
      unitPrice: purchase.unitPrice.toString(),
      affectedQuantity: affected,
      ngos: purchase.planItem.allocations.map((a) => ({ organizationName: a.organization.name, allocatedQuantity: a.quantity })),
      deliveries: purchase.deliveries.map((d) => ({
        id: d.id, trackingRef: d.trackingRef, status: d.status, quantity: d.quantity, deliveredQuantity: d.deliveredQuantity,
      })),
    });
    entry.affectedQuantity += affected;
    plans.set(plan.id, entry);
  }

  return {
    event: {
      id: event.id, type: event.type, isSimulation: event.isSimulation, vendorId: event.vendorId,
      vendorName: event.vendor.name, vendorOfferId: event.vendorOfferId, reason: event.reason, createdAt: event.createdAt,
    },
    affectedPlans: [...plans.values()],
    totalAffectedQuantity: [...plans.values()].reduce((sum, p) => sum + p.affectedQuantity, 0),
  };
};
