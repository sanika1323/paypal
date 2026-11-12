import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { optimizeProcurement, type OptimizationResult } from "./procurement-optimizer.service.js";

type SavePlanInput = {
  emergencyId: string;
  budget: number;
  maxDeliveryDays?: number;
};

const toPaise = (amount: string): number => Math.round(Number(amount) * 100);
const formatMoney = (paise: number): string => (paise / 100).toFixed(2);

export const planInclude = {
  emergency: true,
  items: {
    include: {
      product: true,
      purchases: { include: { vendorOffer: { include: { vendor: true, product: true } } } },
      allocations: { include: { organization: true, reliefRequest: true } },
    },
  },
  approvals: true,
  payments: true,
} as const;

type PersistOptions = {
  emergencyId: string;
  budget: number;
  result: OptimizationResult;
  name: string;
  explanation: string;
  status: "DRAFT" | "APPROVED";
  revisionOfId?: string;
  approvedBy?: string;
  approvalComment?: string;
  auditAction: string;
  auditDetails?: Record<string, unknown>;
};

/**
 * Persists an optimizer result as plan → items → purchases → allocations in the caller's
 * transaction. Used by normal plan creation (DRAFT) and by a human-approved replanning
 * proposal (APPROVED, with the approval recorded).
 */
export const persistOptimizedPlan = async (tx: Prisma.TransactionClient, options: PersistOptions) => {
  const { result } = options;
  const plan = await tx.procurementPlan.create({
    data: {
      emergencyId: options.emergencyId,
      name: options.name,
      totalBudget: options.budget.toFixed(2),
      totalCost: result.estimatedCost,
      status: options.status,
      explanation: options.explanation,
      revisionOfId: options.revisionOfId,
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
    for (const allocation of result.ngoAllocations.filter((a) => a.productId === product.productId)) {
      const amountPaise =
        product.fulfilledQuantity > 0
          ? Math.round((productCostPaise * allocation.allocatedQuantity) / product.fulfilledQuantity)
          : 0;
      await tx.allocation.create({
        data: {
          planId: plan.id,
          planItemId: planItem.id,
          organizationId: allocation.organizationId,
          reliefRequestId: allocation.requestId,
          quantity: allocation.allocatedQuantity,
          amount: formatMoney(amountPaise),
        },
      });
    }
  }

  if (options.status === "APPROVED" && options.approvedBy) {
    await tx.approval.create({
      data: { planId: plan.id, approvedBy: options.approvedBy, approved: true, comments: options.approvalComment ?? null },
    });
  }

  await tx.auditLog.create({
    data: {
      action: options.auditAction,
      entityType: "ProcurementPlan",
      entityId: plan.id,
      details: {
        emergencyId: options.emergencyId,
        emergencyName: result.emergency.name,
        totalBudget: options.budget.toFixed(2),
        totalCost: result.estimatedCost,
        supplierCount: result.supplierPurchases.length,
        productCount: result.products.length,
        fulfilledQuantity: result.fulfillment.fulfilledQuantity,
        status: options.status,
        revisionOfId: options.revisionOfId ?? null,
        ...(options.auditDetails ?? {}),
      } as Prisma.InputJsonObject,
    },
  });

  return tx.procurementPlan.findUniqueOrThrow({ where: { id: plan.id }, include: planInclude });
};

export const createProcurementPlan = async (input: SavePlanInput) => {
  // Always calculate on the server before saving.
  const result = await optimizeProcurement(input);

  if (!result.budgetFeasible) {
    throw new Error("BUDGET_EXCEEDED");
  }

  if (result.fulfillment.unfulfilledQuantity > 0) {
    throw new Error("INSUFFICIENT_SUPPLIER_CAPACITY");
  }

  return prisma.$transaction((tx) =>
    persistOptimizedPlan(tx, {
      emergencyId: input.emergencyId,
      budget: input.budget,
      result,
      name: `${result.emergency.name} Procurement Plan`,
      explanation:
        "Generated using deterministic lowest-cost supplier allocation. Pending human review and approval.",
      status: "DRAFT",
      auditAction: "PROCUREMENT_PLAN_CREATED",
    })
  );
};

export const getAllProcurementPlans = async () => {
  return prisma.procurementPlan.findMany({
    orderBy: { createdAt: "desc" },
    include: planInclude,
  });
};

export const getProcurementPlanById = async (id: string) => {
  return prisma.procurementPlan.findUnique({
    where: { id },
    include: {
      ...planInclude,
      revisionOf: { select: { id: true, name: true, status: true, version: true } },
      revisions: { select: { id: true, name: true, status: true, version: true, createdAt: true } },
    },
  });
};
