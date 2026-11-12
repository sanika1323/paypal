import { prisma } from "../../config/database.js";

export const submitProcurementPlanForApproval = async (
  planId: string
) => {
  return prisma.$transaction(async (tx) => {
    const plan = await tx.procurementPlan.findUnique({
      where: { id: planId },
      include: { approvals: true },
    });

    if (!plan) {
      throw new Error("PLAN_NOT_FOUND");
    }

    if (plan.status !== "DRAFT" && plan.status !== "ANALYZING") {
      throw new Error("PLAN_NOT_ELIGIBLE_FOR_APPROVAL");
    }

    if (plan.approvals.length > 0) {
      throw new Error("APPROVAL_ALREADY_EXISTS");
    }

    const approval = await tx.approval.create({
      data: {
        planId,
        approvedBy: "PENDING_REVIEW",
        approved: false,
        comments: "Awaiting human approval",
      },
    });

    await tx.procurementPlan.update({
      where: { id: planId },
      data: { version: { increment: 1 }, status: "PENDING_APPROVAL" },
    });

    await tx.auditLog.create({
      data: {
        action: "PROCUREMENT_PLAN_SUBMITTED_FOR_APPROVAL",
        entityType: "ProcurementPlan",
        entityId: planId,
        details: {
          approvalId: approval.id,
          previousStatus: plan.status,
          newStatus: "PENDING_APPROVAL",
        },
      },
    });

    return tx.procurementPlan.findUniqueOrThrow({
      where: { id: planId },
      include: {
        emergency: true,
        approvals: true,
        items: true,
        payments: true,
      },
    });
  });
};

export const getPendingApprovals = async () => {
  return prisma.approval.findMany({
    where: {
      plan: {
        status: "PENDING_APPROVAL",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      plan: {
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
            },
          },
        },
      },
    },
  });
};

type ApprovalDecisionInput = {
  approvalId: string;
  approvedBy: string;
  comments?: string;
  approved: boolean;
};

export const decideProcurementApproval = async (
  input: ApprovalDecisionInput
) => {
  return prisma.$transaction(async (tx) => {
    const approval = await tx.approval.findUnique({
      where: { id: input.approvalId },
      include: { plan: true },
    });

    if (!approval) {
      throw new Error("APPROVAL_NOT_FOUND");
    }

    if (approval.plan.status !== "PENDING_APPROVAL") {
      throw new Error("APPROVAL_NOT_PENDING");
    }

    if (!input.approved && !input.comments?.trim()) {
      throw new Error("REJECTION_REASON_REQUIRED");
    }

    const updatedApproval = await tx.approval.update({
      where: { id: input.approvalId },
      data: {
        approved: input.approved,
        approvedBy: input.approvedBy,
        comments: input.comments?.trim() || null,
      },
    });

    const newStatus = input.approved ? "APPROVED" : "REJECTED";

    await tx.procurementPlan.update({
      where: { id: approval.planId },
      data: { version: { increment: 1 }, status: newStatus },
    });

    await tx.auditLog.create({
      data: {
        action: input.approved
          ? "PROCUREMENT_PLAN_APPROVED"
          : "PROCUREMENT_PLAN_REJECTED",
        entityType: "ProcurementPlan",
        entityId: approval.planId,
        details: {
          approvalId: approval.id,
          approvedBy: input.approvedBy,
          comments: input.comments?.trim() || null,
          previousStatus: "PENDING_APPROVAL",
          newStatus,
        },
      },
    });

    return {
      approval: updatedApproval,
      planStatus: newStatus,
    };
  });
};