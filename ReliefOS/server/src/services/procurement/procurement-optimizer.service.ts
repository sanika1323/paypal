import { createHash } from "node:crypto";

import { prisma } from "../../config/database.js";

/**
 * Deterministic procurement optimizer: the single source of truth for quantities,
 * prices, capacity, budget feasibility and NGO allocation.
 *
 * Algorithm (unchanged from the original implementation):
 *  1. Group demand by product.
 *  2. Rank eligible offers by unit price, then delivery days, then vendor name.
 *  3. Buy greedily from the cheapest offer up to its capacity until demand is met.
 *  4. Split each product's fulfilled quantity across NGO requests proportionally,
 *     distributing leftovers by largest remainder, then urgency, then request age.
 *
 * Optional inputs used by replanning (never by the default procurement path):
 *  - `demand`:   an explicit list of {requestId, quantity} instead of all eligible requests
 *                (amendments cover only the affected quantity).
 *  - `scenario`: excluded offers and per-offer overrides applied IN MEMORY ONLY
 *                (what-if simulations never touch stored offers).
 */

export type OfferOverride = {
  capacity?: number;
  unitPrice?: string;
  deliveryDays?: number;
  isAvailable?: boolean;
};

export type OptimizerScenario = {
  excludeOfferIds?: string[];
  offerOverrides?: Record<string, OfferOverride>;
};

export type DemandLine = { requestId: string; quantity: number };

export type OptimizeInput = {
  emergencyId: string;
  budget: number;
  maxDeliveryDays?: number;
  demand?: DemandLine[];
  scenario?: OptimizerScenario;
};

const toPaise = (value: unknown): number => {
  const amount = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    throw new Error("INVALID_OFFER_PRICE");
  }
  const [rupees, fraction = ""] = amount.split(".");
  return Number(rupees) * 100 + Number(fraction.padEnd(2, "0"));
};

const money = (paise: number): string => (paise / 100).toFixed(2);

export type ExcludedOffer = {
  offerId: string;
  vendorName: string;
  productName: string;
  reason: "EXCLUDED_BY_SCENARIO" | "UNAVAILABLE" | "EXPIRED" | "NO_CAPACITY" | "DELIVERY_TOO_SLOW";
};

const loadDemand = async (input: OptimizeInput) => {
  if (!input.demand) {
    const requests = await prisma.reliefRequest.findMany({
      where: {
        emergencyId: input.emergencyId,
        status: { in: ["PENDING", "VERIFIED", "CONSOLIDATED"] },
        organization: { type: "NGO" },
      },
      include: { organization: true, product: true },
      orderBy: { createdAt: "asc" },
    });
    return requests.map((request) => ({ request, quantity: request.quantity }));
  }

  const quantities = new Map<string, number>();
  for (const line of input.demand) {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error("INVALID_DEMAND_QUANTITY");
    }
    quantities.set(line.requestId, (quantities.get(line.requestId) ?? 0) + line.quantity);
  }
  const requests = await prisma.reliefRequest.findMany({
    where: { id: { in: [...quantities.keys()] }, emergencyId: input.emergencyId },
    include: { organization: true, product: true },
    orderBy: { createdAt: "asc" },
  });
  if (requests.length !== quantities.size) {
    throw new Error("DEMAND_REQUEST_NOT_FOUND");
  }
  return requests.map((request) => ({ request, quantity: quantities.get(request.id)! }));
};

export const optimizeProcurement = async (input: OptimizeInput) => {
  const emergency = await prisma.emergency.findUnique({
    where: { id: input.emergencyId },
  });

  if (!emergency) {
    throw new Error("EMERGENCY_NOT_FOUND");
  }

  if (!emergency.isActive) {
    throw new Error("EMERGENCY_INACTIVE");
  }

  const demand = await loadDemand(input);

  if (demand.length === 0) {
    throw new Error("NO_ELIGIBLE_REQUESTS");
  }

  const productIds = [...new Set(demand.map((line) => line.request.productId))];
  const rawOffers = await prisma.vendorOffer.findMany({
    where: { productId: { in: productIds } },
    include: { vendor: true, product: true },
  });

  const now = Date.now();
  const excluded = new Set(input.scenario?.excludeOfferIds ?? []);
  const overrides = input.scenario?.offerOverrides ?? {};
  const excludedOffers: ExcludedOffer[] = [];

  // Apply scenario overrides in memory, then filter by availability, validity and capacity.
  const offers = rawOffers
    .map((offer) => {
      const o = overrides[offer.id];
      return {
        ...offer,
        capacity: o?.capacity ?? offer.capacity,
        unitPrice: o?.unitPrice ?? offer.unitPrice.toString(),
        deliveryDays: o?.deliveryDays ?? offer.deliveryDays,
        isAvailable: o?.isAvailable ?? offer.isAvailable,
      };
    })
    .filter((offer) => {
      const base = { offerId: offer.id, vendorName: offer.vendor.name, productName: offer.product.name };
      if (excluded.has(offer.id)) {
        excludedOffers.push({ ...base, reason: "EXCLUDED_BY_SCENARIO" });
        return false;
      }
      if (!offer.isAvailable) {
        excludedOffers.push({ ...base, reason: "UNAVAILABLE" });
        return false;
      }
      if (offer.validUntil && offer.validUntil.getTime() < now) {
        excludedOffers.push({ ...base, reason: "EXPIRED" });
        return false;
      }
      if (offer.capacity <= 0) {
        excludedOffers.push({ ...base, reason: "NO_CAPACITY" });
        return false;
      }
      if (input.maxDeliveryDays !== undefined && offer.deliveryDays > input.maxDeliveryDays) {
        excludedOffers.push({ ...base, reason: "DELIVERY_TOO_SLOW" });
        return false;
      }
      return true;
    });

  const grouped = new Map<string, typeof demand>();
  for (const line of demand) {
    const existing = grouped.get(line.request.productId) ?? [];
    existing.push(line);
    grouped.set(line.request.productId, existing);
  }

  const productResults = [];
  const allPurchases = [];
  const allAllocations = [];
  let totalDemand = 0;
  let totalFulfilled = 0;
  let totalCostPaise = 0;
  const budgetPaise = Math.round(input.budget * 100);

  for (const [productId, lines] of grouped) {
    const product = lines[0]!.request.product;
    const requestedQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
    totalDemand += requestedQuantity;
    let remaining = requestedQuantity;

    const eligibleOffers = offers
      .filter((offer) => offer.productId === productId)
      .sort((a, b) => {
        const priceDifference = toPaise(a.unitPrice) - toPaise(b.unitPrice);
        if (priceDifference !== 0) return priceDifference;
        if (a.deliveryDays !== b.deliveryDays) return a.deliveryDays - b.deliveryDays;
        return a.vendor.name.localeCompare(b.vendor.name);
      });

    const productPurchases = [];
    let productCostPaise = 0;

    for (const offer of eligibleOffers) {
      if (remaining <= 0) break;
      const quantity = Math.min(remaining, offer.capacity);
      const unitPricePaise = toPaise(offer.unitPrice);
      const lineTotalPaise = quantity * unitPricePaise;
      const purchase = {
        offerId: offer.id,
        vendorId: offer.vendorId,
        vendorName: offer.vendor.name,
        productId,
        productName: product.name,
        quantity,
        unit: product.unit,
        unitPrice: money(unitPricePaise),
        totalAmount: money(lineTotalPaise),
        deliveryDays: offer.deliveryDays,
      };
      productPurchases.push(purchase);
      allPurchases.push(purchase);
      productCostPaise += lineTotalPaise;
      remaining -= quantity;
    }

    const fulfilledQuantity = requestedQuantity - remaining;
    totalFulfilled += fulfilledQuantity;
    totalCostPaise += productCostPaise;

    // Proportional NGO allocation using largest remainder.
    const allocations = lines.map((line) => {
      const exactShare = (fulfilledQuantity * line.quantity) / requestedQuantity;
      const baseQuantity = Math.floor(exactShare);
      return { line, allocatedQuantity: baseQuantity, fractionalRemainder: exactShare - baseQuantity };
    });

    let unallocated = fulfilledQuantity - allocations.reduce((sum, item) => sum + item.allocatedQuantity, 0);

    allocations.sort((a, b) => {
      if (b.fractionalRemainder !== a.fractionalRemainder) return b.fractionalRemainder - a.fractionalRemainder;
      if (b.line.request.urgency !== a.line.request.urgency) return b.line.request.urgency - a.line.request.urgency;
      return a.line.request.createdAt.getTime() - b.line.request.createdAt.getTime();
    });

    for (const allocation of allocations) {
      if (unallocated <= 0) break;
      allocation.allocatedQuantity += 1;
      unallocated -= 1;
    }

    for (const allocation of allocations) {
      const request = allocation.line.request;
      allAllocations.push({
        requestId: request.id,
        organizationId: request.organizationId,
        organizationName: request.organization.name,
        productId,
        productName: product.name,
        requestedQuantity: allocation.line.quantity,
        allocatedQuantity: allocation.allocatedQuantity,
        unfulfilledQuantity: allocation.line.quantity - allocation.allocatedQuantity,
        urgency: request.urgency,
      });
    }

    productResults.push({
      productId,
      productName: product.name,
      unit: product.unit,
      requestedQuantity,
      fulfilledQuantity,
      unfulfilledQuantity: remaining,
      estimatedCost: money(productCostPaise),
      purchases: productPurchases,
    });
  }

  const budgetFeasible = totalCostPaise <= budgetPaise;

  // Fingerprint of every input the result depends on; a changed fingerprint means stale data.
  const inputFingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        budget: budgetPaise,
        maxDeliveryDays: input.maxDeliveryDays ?? null,
        demand: demand.map((l) => [l.request.id, l.quantity]).sort(),
        offers: offers
          .map((o) => [o.id, String(o.unitPrice), o.capacity, o.deliveryDays])
          .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
      })
    )
    .digest("hex");

  return {
    emergency: {
      id: emergency.id,
      name: emergency.name,
      location: emergency.location,
      severity: emergency.severity,
    },
    budget: money(budgetPaise),
    estimatedCost: money(totalCostPaise),
    remainingBudget: money(Math.max(0, budgetPaise - totalCostPaise)),
    budgetFeasible,
    fulfillment: {
      totalDemand,
      fulfilledQuantity: totalFulfilled,
      unfulfilledQuantity: totalDemand - totalFulfilled,
      fulfillmentPercentage: totalDemand > 0 ? Number(((totalFulfilled / totalDemand) * 100).toFixed(2)) : 0,
    },
    feasible: budgetFeasible && totalFulfilled === totalDemand,
    constraints: {
      maxDeliveryDays: input.maxDeliveryDays ?? null,
      budgetFeasible,
      supplierCapacitySufficient: totalFulfilled === totalDemand,
    },
    products: productResults,
    supplierPurchases: allPurchases,
    ngoAllocations: allAllocations,
    excludedOffers,
    demandScope: input.demand ? "EXPLICIT" : "ALL_ELIGIBLE_REQUESTS",
    scenarioApplied: Boolean(input.scenario && (excluded.size > 0 || Object.keys(overrides).length > 0)),
    inputFingerprint,
    optimizationMethod:
      "Deterministic lowest-unit-price allocation, with delivery time as tie-breaker and proportional NGO distribution.",
    isPreview: true,
  };
};

export type OptimizationResult = Awaited<ReturnType<typeof optimizeProcurement>>;
