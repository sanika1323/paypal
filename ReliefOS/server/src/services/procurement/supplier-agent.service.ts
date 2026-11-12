
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

  // Fetch real supplier offers from the database.
  const offers = await prisma.vendorOffer.findMany({
    where: {
      productId: {
        in: productIds,
      },
      capacity: {
        gt: 0,
      },
    },
    include: {
      vendor: true,
      product: true,
    },
  });

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
    methodology:
      "Supplier offers are evaluated using stored capacity, unit price, delivery time and vendor reliability. Offers are ranked by unit price, delivery time and reliability. No inventory is reserved and no supplier offer is modified.",
    generatedAt: new Date().toISOString(),
  };
};
