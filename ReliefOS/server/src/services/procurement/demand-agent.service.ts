
import { prisma } from "../../config/database.js";

type DemandAgentInput = {
  emergencyId: string;
};

export const runDemandAgent = async (
  input: DemandAgentInput
) => {
  const emergency = await prisma.emergency.findUnique({
    where: {
      id: input.emergencyId,
    },
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

  const grouped = new Map<
    string,
    typeof requests
  >();

  for (const request of requests) {
    const existing =
      grouped.get(request.productId) ?? [];

    existing.push(request);
    grouped.set(request.productId, existing);
  }

  const products = Array.from(grouped.entries()).map(
    ([productId, productRequests]) => {
      const product = productRequests[0].product;

      const totalQuantity = productRequests.reduce(
        (sum, request) => sum + request.quantity,
        0
      );

      const urgencyWeightedTotal =
        productRequests.reduce(
          (sum, request) =>
            sum + request.quantity * request.urgency,
          0
        );

      const averageUrgency =
        totalQuantity > 0
          ? Number(
              (
                urgencyWeightedTotal / totalQuantity
              ).toFixed(2)
            )
          : 0;

      return {
        productId,
        productName: product.name,
        category: product.category,
        unit: product.unit,
        totalQuantity,
        requestCount: productRequests.length,
        averageUrgency,
        maxUrgency: Math.max(...productRequests.map((r) => r.urgency)),
        priority: Math.max(...productRequests.map((r) => r.urgency)) >= 4 ? "HIGH" : "NORMAL",
        organizations: productRequests.map(
          (request) => ({
            requestId: request.id,
            organizationId: request.organizationId,
            organizationName: request.organization.name,
            requestedQuantity: request.quantity,
            urgency: request.urgency,
            status: request.status,
            notes: request.notes,
            createdAt: request.createdAt,
          })
        ),
      };
    }
  );

  // Duplicate / conflicting requests: the same NGO asking for the same product more than once.
  // Reported only; original requests are never modified.
  const byOrgProduct = new Map<string, typeof requests>();
  for (const request of requests) {
    const key = `${request.organizationId}:${request.productId}`;
    byOrgProduct.set(key, [...(byOrgProduct.get(key) ?? []), request]);
  }
  const issues = [...byOrgProduct.values()]
    .filter((group) => group.length > 1)
    .map((group) => {
      const quantities = [...new Set(group.map((r) => r.quantity))];
      return {
        type: quantities.length === 1 ? ("DUPLICATE_REQUEST" as const) : ("CONFLICTING_QUANTITIES" as const),
        organizationId: group[0]!.organizationId,
        organizationName: group[0]!.organization.name,
        productId: group[0]!.productId,
        productName: group[0]!.product.name,
        requestIds: group.map((r) => r.id),
        quantities: group.map((r) => r.quantity),
        message:
          quantities.length === 1
            ? `${group.length} identical requests; may double-count demand.`
            : `${group.length} requests with different quantities; confirm the intended total.`,
      };
    });

  const totalDemand = products.reduce(
    (sum, product) => sum + product.totalQuantity,
    0
  );

  const organizationIds = [
    ...new Set(
      requests.map((request) => request.organizationId)
    ),
  ];

  return {
    agent: "DEMAND_AGENT",
    status: "COMPLETED",
    emergency: {
      id: emergency.id,
      name: emergency.name,
      location: emergency.location,
      severity: emergency.severity,
    },
    summary: {
      totalRequests: requests.length,
      participatingOrganizations: organizationIds.length,
      distinctProducts: products.length,
      totalDemand,
      duplicateOrConflictingGroups: issues.length,
    },
    products: [...products].sort((a, b) => b.maxUrgency - a.maxUrgency),
    issues,
    methodology:
      "Eligible NGO requests are grouped by product. Quantities are summed, while organization-level requirements and urgency are preserved.",
    generatedAt: new Date().toISOString(),
  };
};
