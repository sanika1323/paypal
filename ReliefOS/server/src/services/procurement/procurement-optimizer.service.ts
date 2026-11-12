import { prisma } from "../../config/database.js";

type OptimizeInput = {
  emergencyId: string;
  budget: number;
  maxDeliveryDays?: number;
};

const toPaise = (value: unknown): number => {
  const amount = String(value);

  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    throw new Error("INVALID_OFFER_PRICE");
  }

  const [rupees, fraction = ""] = amount.split(".");
  return Number(rupees) * 100 + Number(fraction.padEnd(2, "0"));
};

const money = (paise: number): string =>
  (paise / 100).toFixed(2);

export const optimizeProcurement = async (
  input: OptimizeInput
) => {
  const emergency = await prisma.emergency.findUnique({
    where: { id: input.emergencyId },
  });

  if (!emergency) {
    throw new Error("EMERGENCY_NOT_FOUND");
  }

  if (!emergency.isActive) {
    throw new Error("EMERGENCY_INACTIVE");
  }

  const requests = await prisma.reliefRequest.findMany({
    where: {
      emergencyId: input.emergencyId,
      status: {
        in: ["PENDING", "VERIFIED", "CONSOLIDATED"],
      },
      organization: {
        type: "NGO",
      },
    },
    include: {
      organization: true,
      product: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (requests.length === 0) {
    throw new Error("NO_ELIGIBLE_REQUESTS");
  }

  const productIds = [
    ...new Set(requests.map((request) => request.productId)),
  ];

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

  const groupedRequests = new Map<
    string,
    typeof requests
  >();

  for (const request of requests) {
    const existing =
      groupedRequests.get(request.productId) ?? [];

    existing.push(request);
    groupedRequests.set(request.productId, existing);
  }

  const productResults = [];
  const allPurchases = [];
  const allAllocations = [];

  let totalDemand = 0;
  let totalFulfilled = 0;
  let totalCostPaise = 0;

  const budgetPaise = Math.round(input.budget * 100);

  for (const [productId, productRequests] of groupedRequests) {
    const product = productRequests[0].product;

    const requestedQuantity = productRequests.reduce(
      (sum, request) => sum + request.quantity,
      0
    );

    totalDemand += requestedQuantity;

    let remaining = requestedQuantity;

    const eligibleOffers = offers
      .filter((offer) => {
        if (offer.productId !== productId) {
          return false;
        }

        if (
          input.maxDeliveryDays !== undefined &&
          offer.deliveryDays > input.maxDeliveryDays
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceDifference =
          toPaise(a.unitPrice) - toPaise(b.unitPrice);

        if (priceDifference !== 0) {
          return priceDifference;
        }

        if (a.deliveryDays !== b.deliveryDays) {
          return a.deliveryDays - b.deliveryDays;
        }

        return a.vendor.name.localeCompare(b.vendor.name);
      });

    const productPurchases = [];
    let productCostPaise = 0;

    for (const offer of eligibleOffers) {
      if (remaining <= 0) {
        break;
      }

      const quantity = Math.min(
        remaining,
        offer.capacity
      );

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

    const fulfilledQuantity =
      requestedQuantity - remaining;

    totalFulfilled += fulfilledQuantity;
    totalCostPaise += productCostPaise;

    // Proportional NGO allocation using largest remainder.
    const allocations = productRequests.map((request) => {
      const exactShare =
        (fulfilledQuantity * request.quantity) /
        requestedQuantity;

      const baseQuantity = Math.floor(exactShare);

      return {
        request,
        allocatedQuantity: baseQuantity,
        fractionalRemainder: exactShare - baseQuantity,
      };
    });

    let unallocated =
      fulfilledQuantity -
      allocations.reduce(
        (sum, item) => sum + item.allocatedQuantity,
        0
      );

    allocations.sort((a, b) => {
      if (
        b.fractionalRemainder !==
        a.fractionalRemainder
      ) {
        return (
          b.fractionalRemainder -
          a.fractionalRemainder
        );
      }

      if (b.request.urgency !== a.request.urgency) {
        return b.request.urgency - a.request.urgency;
      }

      return (
        a.request.createdAt.getTime() -
        b.request.createdAt.getTime()
      );
    });

    for (const allocation of allocations) {
      if (unallocated <= 0) {
        break;
      }

      allocation.allocatedQuantity += 1;
      unallocated -= 1;
    }

    for (const allocation of allocations) {
      const request = allocation.request;

      allAllocations.push({
        requestId: request.id,
        organizationId: request.organizationId,
        organizationName: request.organization.name,
        productId,
        productName: product.name,
        requestedQuantity: request.quantity,
        allocatedQuantity: allocation.allocatedQuantity,
        unfulfilledQuantity:
          request.quantity - allocation.allocatedQuantity,
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

  return {
    emergency: {
      id: emergency.id,
      name: emergency.name,
      location: emergency.location,
      severity: emergency.severity,
    },
    budget: money(budgetPaise),
    estimatedCost: money(totalCostPaise),
    remainingBudget: money(
      Math.max(0, budgetPaise - totalCostPaise)
    ),
    budgetFeasible,
    fulfillment: {
      totalDemand,
      fulfilledQuantity: totalFulfilled,
      unfulfilledQuantity: totalDemand - totalFulfilled,
      fulfillmentPercentage:
        totalDemand > 0
          ? Number(
              ((totalFulfilled / totalDemand) * 100).toFixed(2)
            )
          : 0,
    },
    feasible:
      budgetFeasible && totalFulfilled === totalDemand,
    constraints: {
      maxDeliveryDays: input.maxDeliveryDays ?? null,
      budgetFeasible,
      supplierCapacitySufficient:
        totalFulfilled === totalDemand,
    },
    products: productResults,
    supplierPurchases: allPurchases,
    ngoAllocations: allAllocations,
    optimizationMethod:
      "Deterministic lowest-unit-price allocation, with delivery time as tie-breaker and proportional NGO distribution.",
    isPreview: true,
  };
};