import { prisma } from "../../config/database.js";
export const runDemandAgent = async (input) => {
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
    const grouped = new Map();
    for (const request of requests) {
        const existing = grouped.get(request.productId) ?? [];
        existing.push(request);
        grouped.set(request.productId, existing);
    }
    const products = Array.from(grouped.entries()).map(([productId, productRequests]) => {
        const product = productRequests[0].product;
        const totalQuantity = productRequests.reduce((sum, request) => sum + request.quantity, 0);
        const urgencyWeightedTotal = productRequests.reduce((sum, request) => sum + request.quantity * request.urgency, 0);
        const averageUrgency = totalQuantity > 0
            ? Number((urgencyWeightedTotal / totalQuantity).toFixed(2))
            : 0;
        return {
            productId,
            productName: product.name,
            category: product.category,
            unit: product.unit,
            totalQuantity,
            requestCount: productRequests.length,
            averageUrgency,
            organizations: productRequests.map((request) => ({
                requestId: request.id,
                organizationId: request.organizationId,
                organizationName: request.organization.name,
                requestedQuantity: request.quantity,
                urgency: request.urgency,
                status: request.status,
                notes: request.notes,
                createdAt: request.createdAt,
            })),
        };
    });
    const totalDemand = products.reduce((sum, product) => sum + product.totalQuantity, 0);
    const organizationIds = [
        ...new Set(requests.map((request) => request.organizationId)),
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
        },
        products,
        methodology: "Eligible NGO requests are grouped by product. Quantities are summed, while organization-level requirements and urgency are preserved.",
        generatedAt: new Date().toISOString(),
    };
};
//# sourceMappingURL=demand-agent.service.js.map