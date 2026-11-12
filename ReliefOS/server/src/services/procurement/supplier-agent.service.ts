
import { prisma } from "../../config/database.js";
import { runDemandAgent } from "./demand-agent.service.js";

type SupplierAgentInput = {
  emergencyId: string;
};

export const runSupplierAgent = async (
  input: SupplierAgentInput
) => {
  // First obtain the actual consolidated demand.
  const demand = await runDemandAgent({
    emergencyId: input.emergencyId,
  });

  const productIds = demand.products.map(
    (product) => product.productId
  );

  // Fetch real supplier offers from the database (all of them: unusable ones are reported, not hidden).
  const allOffers = await prisma.vendorOffer.findMany({
    where: { productId: { in: productIds } },
    include: { vendor: true, product: true },
  });
  const now = Date.now();
  const offerState = (offer: (typeof allOffers)[number]) =>
    !offer.isAvailable
      ? "UNAVAILABLE"
      : offer.validUntil && offer.validUntil.getTime() < now
        ? "EXPIRED"
        : offer.capacity <= 0
          ? "NO_CAPACITY"
          : "USABLE";
  const offers = allOffers.filter((offer) => offerState(offer) === "USABLE");
  const unusableOffers = allOffers
    .filter((offer) => offerState(offer) !== "USABLE")
    .map((offer) => ({
      offerId: offer.id,
      vendorName: offer.vendor.name,
      productName: offer.product.name,
      state: offerState(offer),
      validUntil: offer.validUntil,
    }));

  // Supplier risk: reliability plus REAL failure events in the last 90 days (simulations excluded).
  const since = new Date(now - 90 * 24 * 60 * 60 * 1000);
  const failures = await prisma.supplierFailureEvent.groupBy({
    by: ["vendorId"],
    where: { isSimulation: false, createdAt: { gte: since }, vendorId: { in: [...new Set(allOffers.map((o) => o.vendorId))] } },
    _count: { _all: true },
  });
  const failureCount = new Map(failures.map((row) => [row.vendorId, row._count._all]));
  const riskOf = (vendorId: string, reliability: number) => {
    const recentFailures = failureCount.get(vendorId) ?? 0;
    const rated = reliability > 0;
    const failurePart = Math.min(recentFailures, 5) / 5;
    // Unrated suppliers are scored on failure history only (a 0 rating means "not rated").
    const score = Number((rated ? 0.6 * (1 - Math.min(1, reliability)) + 0.4 * failurePart : failurePart).toFixed(3));
    return { reliabilityRated: rated, recentFailures, riskScore: score, riskLevel: score >= 0.5 ? "HIGH" : score >= 0.25 ? "MEDIUM" : "LOW" };
  };

  const products = demand.products.map((product) => {
    const productOffers = offers
      .filter(
        (offer) => offer.productId === product.productId
      )
      .sort((a, b) => {
        const priceDifference =
          Number(a.unitPrice) - Number(b.unitPrice);

        if (priceDifference !== 0) {
          return priceDifference;
        }

        if (a.deliveryDays !== b.deliveryDays) {
          return a.deliveryDays - b.deliveryDays;
        }

        if (a.vendor.reliability !== b.vendor.reliability) {
          return b.vendor.reliability - a.vendor.reliability;
        }

        return a.vendor.name.localeCompare(b.vendor.name);
      });

    const evaluatedOffers = productOffers.map(
      (offer, index) => {
        const unitPrice = Number(
          offer.unitPrice.toString()
        );

        const fulfillableQuantity = Math.min(
          offer.capacity,
          product.totalQuantity
        );

        return {
          rank: index + 1,
          offerId: offer.id,
          vendorId: offer.vendorId,
          vendorName: offer.vendor.name,
          vendorLocation: offer.vendor.location,
          vendorReliability: offer.vendor.reliability,
          ...riskOf(offer.vendorId, offer.vendor.reliability),
          validUntil: offer.validUntil,
          productId: offer.productId,
          unitPrice: unitPrice.toFixed(2),
          capacity: offer.capacity,
          deliveryDays: offer.deliveryDays,
          fulfillableQuantity,
          remainingDemand:
            product.totalQuantity - fulfillableQuantity,
          capacitySufficient:
            offer.capacity >= product.totalQuantity,
          estimatedCostForAvailableQuantity: (
            unitPrice * fulfillableQuantity
          ).toFixed(2),
        };
      }
    );

    const totalAvailableCapacity =
      evaluatedOffers.reduce(
        (sum, offer) => sum + offer.capacity,
        0
      );

    const cheapestOffer = evaluatedOffers[0] ?? null;

    const fastestOffer = [...evaluatedOffers].sort(
      (a, b) => {
        if (a.deliveryDays !== b.deliveryDays) {
          return a.deliveryDays - b.deliveryDays;
        }

        return Number(a.unitPrice) - Number(b.unitPrice);
      }
    )[0] ?? null;

    return {
      productId: product.productId,
      productName: product.productName,
      unit: product.unit,
      requiredQuantity: product.totalQuantity,
      supplierCount: evaluatedOffers.length,
      totalAvailableCapacity,
      aggregateCapacitySufficient:
        totalAvailableCapacity >= product.totalQuantity,
      cheapestOffer,
      fastestOffer,
      offers: evaluatedOffers,
    };
  });

  return {
    agent: "SUPPLIER_AGENT",
    status: "COMPLETED",
    emergency: demand.emergency,
    summary: {
      productsEvaluated: products.length,
      totalOffersEvaluated: offers.length,
      productsWithSupplierOffers: products.filter(
        (product) => product.supplierCount > 0
      ).length,
      productsWithoutSupplierOffers: products.filter(
        (product) => product.supplierCount === 0
      ).length,
    },
    products,
    unusableOffers,
    riskMethod:
      "riskScore = 0.6 × (1 − reliability) + 0.4 × min(real failures in 90 days, 5)/5; unrated suppliers (reliability 0) are scored on failures only. Simulations are excluded.",
    methodology:
      "Supplier offers are evaluated using stored capacity, unit price, delivery time and vendor reliability. Offers are ranked by unit price, delivery time and reliability. No inventory is reserved and no supplier offer is modified.",
    generatedAt: new Date().toISOString(),
  };
};
