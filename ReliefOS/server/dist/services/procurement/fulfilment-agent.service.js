import { prisma } from "../../config/database.js";
export const runFulfilmentAgent = async (input) => {
    const emergency = await prisma.emergency.findUnique({
        where: {
            id: input.emergencyId,
        },
    });
    if (!emergency) {
        throw new Error("EMERGENCY_NOT_FOUND");
    }
    const plans = await prisma.procurementPlan.findMany({
        where: {
            emergencyId: input.emergencyId,
        },
        include: {
            approvals: true,
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
                },
            },
            payments: {
                include: {
                    deliveries: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const planResults = plans.map((plan) => {
        const purchases = plan.items.flatMap((item) => item.purchases.map((purchase) => ({
            purchaseId: purchase.id,
            productName: item.product.name,
            quantity: purchase.quantity,
            unit: item.unit,
            vendor: {
                id: purchase.vendorOffer.vendor.id,
                name: purchase.vendorOffer.vendor.name,
                location: purchase.vendorOffer.vendor.location,
            },
            unitPrice: purchase.unitPrice.toString(),
            totalAmount: purchase.totalAmount.toString(),
            deliveryDays: purchase.deliveryDays,
        })));
        const payments = plan.payments.map((payment) => ({
            paymentId: payment.id,
            amount: payment.amount.toString(),
            currency: payment.currency,
            status: payment.status,
            paypalOrderId: payment.paypalOrderId,
            paypalCaptureId: payment.paypalCaptureId,
            deliveries: payment.deliveries.map((delivery) => ({
                deliveryId: delivery.id,
                trackingRef: delivery.trackingRef,
                destination: delivery.destination,
                quantity: delivery.quantity,
                status: delivery.status,
                estimatedAt: delivery.estimatedAt,
                deliveredAt: delivery.deliveredAt,
            })),
        }));
        const deliveryRecords = payments.flatMap((payment) => payment.deliveries);
        const approvalGranted = plan.approvals.some((approval) => approval.approved);
        let nextAction = "AWAITING_APPROVAL";
        if (plan.status === "CANCELLED") {
            nextAction = "PLAN_CANCELLED";
        }
        else if (plan.status === "DRAFT" ||
            plan.status === "PENDING_APPROVAL" ||
            plan.status === "ANALYZING") {
            nextAction = "AWAITING_APPROVAL";
        }
        else if (!approvalGranted) {
            nextAction = "APPROVAL_REQUIRED";
        }
        else if (payments.length === 0) {
            nextAction = "AWAITING_PAYMENT";
        }
        else if (deliveryRecords.length === 0) {
            nextAction = "AWAITING_DISPATCH";
        }
        else if (deliveryRecords.every((delivery) => delivery.status === "DELIVERED")) {
            nextAction = "DELIVERY_COMPLETED";
        }
        else {
            nextAction = "DELIVERY_IN_PROGRESS";
        }
        return {
            planId: plan.id,
            planName: plan.name,
            planStatus: plan.status,
            totalBudget: plan.totalBudget.toString(),
            totalCost: plan.totalCost.toString(),
            approvalGranted,
            approvalCount: plan.approvals.length,
            purchases,
            payments,
            deliverySummary: {
                totalDeliveries: deliveryRecords.length,
                delivered: deliveryRecords.filter((delivery) => delivery.status === "DELIVERED").length,
                inTransit: deliveryRecords.filter((delivery) => delivery.status === "IN_TRANSIT").length,
                delayed: deliveryRecords.filter((delivery) => delivery.status === "DELAYED").length,
                pending: deliveryRecords.filter((delivery) => delivery.status === "PENDING").length,
            },
            nextAction,
        };
    });
    const allDeliveries = planResults.flatMap((plan) => plan.payments.flatMap((payment) => payment.deliveries));
    return {
        agent: "FULFILMENT_AGENT",
        status: "COMPLETED",
        emergency: {
            id: emergency.id,
            name: emergency.name,
            location: emergency.location,
            severity: emergency.severity,
        },
        summary: {
            totalPlans: plans.length,
            totalSupplierPurchases: planResults.reduce((sum, plan) => sum + plan.purchases.length, 0),
            totalPayments: planResults.reduce((sum, plan) => sum + plan.payments.length, 0),
            totalDeliveries: allDeliveries.length,
            delivered: allDeliveries.filter((delivery) => delivery.status === "DELIVERED").length,
            inTransit: allDeliveries.filter((delivery) => delivery.status === "IN_TRANSIT").length,
            delayed: allDeliveries.filter((delivery) => delivery.status === "DELAYED").length,
        },
        plans: planResults,
        methodology: "Fulfilment status is derived from persisted procurement plans, approvals, payments and delivery records. This agent is read-only and does not create payments, dispatch orders or modify delivery statuses.",
        generatedAt: new Date().toISOString(),
    };
};
//# sourceMappingURL=fulfilment-agent.service.js.map