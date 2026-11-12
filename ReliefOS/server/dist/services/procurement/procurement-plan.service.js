import { prisma } from "../../config/database.js";
import { optimizeProcurement } from "./procurement-optimizer.service.js";
const toPaise = (amount) => Math.round(Number(amount) * 100);
const formatMoney = (paise) => (paise / 100).toFixed(2);
export const createProcurementPlan = async (input) => {
    // Always calculate on the server before saving.
    const result = await optimizeProcurement(input);
    if (!result.budgetFeasible) {
        throw new Error("BUDGET_EXCEEDED");
    }
    if (result.fulfillment.unfulfilledQuantity > 0) {
        throw new Error("INSUFFICIENT_SUPPLIER_CAPACITY");
    }
    return prisma.$transaction(async (tx) => {
        const plan = await tx.procurementPlan.create({
            data: {
                emergencyId: input.emergencyId,
                name: `${result.emergency.name} Procurement Plan`,
                totalBudget: input.budget.toFixed(2),
                totalCost: result.estimatedCost,
                status: "DRAFT",
                explanation: "Generated using deterministic lowest-cost supplier allocation. Pending human review and approval.",
            },
        });
        for (const product of result.products) {
            const planItem = await tx.procurementPlanItem.create({
                data: {
                    planId: plan.id,
                    productId: product.productId,
                    requestedQuantity: product.requestedQuantity,
                    purchasedQuantity: product.fulfilledQuantity,
                    unfulfilledQuantity: product.unfulfilledQuantity,
                    unit: product.unit,
                },
            });
            for (const purchase of product.purchases) {
                await tx.procurementPurchase.create({
                    data: {
                        planItemId: planItem.id,
                        vendorOfferId: purchase.offerId,
                        quantity: purchase.quantity,
                        unitPrice: purchase.unitPrice,
                        totalAmount: purchase.totalAmount,
                        deliveryDays: purchase.deliveryDays,
                    },
                });
            }
            const productCostPaise = toPaise(product.estimatedCost);
            const productAllocations = result.ngoAllocations.filter((allocation) => allocation.productId === product.productId);
            for (const allocation of productAllocations) {
                const allocationAmountPaise = product.fulfilledQuantity > 0
                    ? Math.round((productCostPaise *
                        allocation.allocatedQuantity) /
                        product.fulfilledQuantity)
                    : 0;
                await tx.allocation.create({
                    data: {
                        planId: plan.id,
                        planItemId: planItem.id,
                        organizationId: allocation.organizationId,
                        reliefRequestId: allocation.requestId,
                        quantity: allocation.allocatedQuantity,
                        amount: formatMoney(allocationAmountPaise),
                    },
                });
            }
        }
        await tx.auditLog.create({
            data: {
                action: "PROCUREMENT_PLAN_CREATED",
                entityType: "ProcurementPlan",
                entityId: plan.id,
                details: {
                    emergencyId: input.emergencyId,
                    emergencyName: result.emergency.name,
                    totalBudget: input.budget.toFixed(2),
                    totalCost: result.estimatedCost,
                    supplierCount: result.supplierPurchases.length,
                    productCount: result.products.length,
                    fulfilledQuantity: result.fulfillment.fulfilledQuantity,
                    status: "DRAFT",
                },
            },
        });
        return tx.procurementPlan.findUniqueOrThrow({
            where: {
                id: plan.id,
            },
            include: {
                emergency: true,
                items: {
                    include: {
                        product: true,
                        purchases: {
                            include: {
                                vendorOffer: {
                                    include: {
                                        vendor: true,
                                        product: true,
                                    },
                                },
                            },
                        },
                        allocations: {
                            include: {
                                organization: true,
                                reliefRequest: true,
                            },
                        },
                    },
                },
                approvals: true,
                payments: true,
            },
        });
    });
};
export const getAllProcurementPlans = async () => {
    return prisma.procurementPlan.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            emergency: true,
            items: {
                include: {
                    product: true,
                    purchases: {
                        include: {
                            vendorOffer: {
                                include: {
                                    vendor: true,
                                },
                            },
                        },
                    },
                    allocations: {
                        include: {
                            organization: true,
                        },
                    },
                },
            },
            approvals: true,
            payments: true,
        },
    });
};
export const getProcurementPlanById = async (id) => {
    return prisma.procurementPlan.findUnique({
        where: { id },
        include: {
            emergency: true,
            items: {
                include: {
                    product: true,
                    purchases: {
                        include: {
                            vendorOffer: {
                                include: {
                                    vendor: true,
                                    product: true,
                                },
                            },
                        },
                    },
                    allocations: {
                        include: {
                            organization: true,
                            reliefRequest: true,
                        },
                    },
                },
            },
            approvals: true,
            payments: true,
        },
    });
};
//# sourceMappingURL=procurement-plan.service.js.map