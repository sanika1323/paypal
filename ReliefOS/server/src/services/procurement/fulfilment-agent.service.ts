
import { prisma } from "../../config/database.js";

type FulfilmentAgentInput = {
  emergencyId: string;
};

export const runFulfilmentAgent = async (
  input: FulfilmentAgentInput
) => {
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
          allocations: true,
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
    const purchases = plan.items.flatMap((item) =>
      item.purchases.map((purchase) => ({
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
      }))
    );

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
        dispatchedQuantity: delivery.dispatchedQuantity,
        deliveredQuantity: delivery.deliveredQuantity,
        delayReason: delivery.delayReason,
        failureReason: delivery.failureReason,
        estimatedAt: delivery.estimatedAt,
        deliveredAt: delivery.deliveredAt,
      })),
    }));

    const deliveryRecords = payments.flatMap(
      (payment) => payment.deliveries
    );

    const approvalGranted = plan.approvals.some(
      (approval) => approval.approved
    );

    let nextAction = "AWAITING_APPROVAL";

    if (
      plan.status === "CANCELLED"
    ) {
      nextAction = "PLAN_CANCELLED";
    } else if (
      plan.status === "DRAFT" ||
      plan.status === "PENDING_APPROVAL" ||
      plan.status === "ANALYZING"
    ) {
      nextAction = "AWAITING_APPROVAL";
    } else if (!approvalGranted) {
      nextAction = "APPROVAL_REQUIRED";
    } else if (payments.length === 0) {
      nextAction = "AWAITING_PAYMENT";
    } else if (deliveryRecords.length === 0) {
      nextAction = "AWAITING_DISPATCH";
    } else if (
      deliveryRecords.every(
        (delivery) => delivery.status === "DELIVERED"
      )
    ) {
      nextAction = "DELIVERY_COMPLETED";
    } else {
      nextAction = "DELIVERY_IN_PROGRESS";
    }

    const quantities = {
      allocated: plan.items.reduce((s, i) => s + i.allocations.reduce((a, x) => a + x.quantity, 0), 0),
      purchased: plan.items.reduce((s, i) => s + i.purchasedQuantity, 0),
      dispatched: deliveryRecords.reduce((s, d) => s + d.dispatchedQuantity, 0),
      delivered: deliveryRecords.reduce((s, d) => s + d.deliveredQuantity, 0),
      delayed: deliveryRecords.filter((d) => d.status === "DELAYED").reduce((s, d) => s + d.quantity, 0),
      failedOrShort: deliveryRecords.reduce(
        (s, d) => s + (d.status === "FAILED" || d.status === "DELIVERED" ? d.quantity - d.deliveredQuantity : 0),
        0
      ),
    };
    const blockers: string[] = [];
    if (plan.status === "DRAFT") blockers.push("Plan not yet submitted for approval.");
    if (plan.status === "PENDING_APPROVAL") blockers.push("Awaiting human approval.");
    if (plan.status === "APPROVED" && payments.length === 0) blockers.push("Approved but not paid.");
    if (payments.some((p) => ["PENDING", "APPROVED", "PROCESSING"].includes(p.status))) blockers.push("Payment awaiting PayPal capture.");
    if (payments.some((p) => p.status === "COMPLETED") && deliveryRecords.length === 0) blockers.push("Paid, but no delivery records generated.");
    if (quantities.delayed > 0) blockers.push(`${quantities.delayed} unit(s) delayed.`);
    if (quantities.failedOrShort > 0) blockers.push(`${quantities.failedOrShort} unit(s) failed or short-delivered: needs an amendment proposal.`);

    return {
      planId: plan.id,
      planVersion: plan.version,
      quantities,
      blockers,
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
        delivered: deliveryRecords.filter(
          (delivery) => delivery.status === "DELIVERED"
        ).length,
        inTransit: deliveryRecords.filter(
          (delivery) => delivery.status === "IN_TRANSIT"
        ).length,
        delayed: deliveryRecords.filter(
          (delivery) => delivery.status === "DELAYED"
        ).length,
        pending: deliveryRecords.filter(
          (delivery) => delivery.status === "PENDING"
        ).length,
      },
      nextAction,
    };
  });

  const allDeliveries = planResults.flatMap(
    (plan) => plan.payments.flatMap(
      (payment) => payment.deliveries
    )
  );

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
      totalSupplierPurchases: planResults.reduce(
        (sum, plan) => sum + plan.purchases.length,
        0
      ),
      totalPayments: planResults.reduce(
        (sum, plan) => sum + plan.payments.length,
        0
      ),
      totalDeliveries: allDeliveries.length,
      delivered: allDeliveries.filter(
        (delivery) => delivery.status === "DELIVERED"
      ).length,
      inTransit: allDeliveries.filter(
        (delivery) => delivery.status === "IN_TRANSIT"
      ).length,
      delayed: allDeliveries.filter(
        (delivery) => delivery.status === "DELAYED"
      ).length,
    },
    plans: planResults,
    methodology:
      "Fulfilment status is derived from persisted procurement plans, approvals, payments and delivery records. This agent is read-only and does not create payments, dispatch orders or modify delivery statuses.",
    generatedAt: new Date().toISOString(),
  };
};
