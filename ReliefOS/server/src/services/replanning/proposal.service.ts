import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";
import {
  optimizeProcurement,
  type DemandLine,
  type OfferOverride,
  type OptimizationResult,
} from "../procurement/procurement-optimizer.service.js";
import { persistOptimizedPlan, planInclude } from "../procurement/procurement-plan.service.js";

/**
 * Replanning proposals.
 *
 *   generate (Replanning Agent) → validate (independent Revalidation Agent + server recompute)
 *   → submit → human approve/reject → commit (new plan; the original is never edited in place)
 *
 * REPLACEMENT: the source plan is unpaid. On approval it is CANCELLED (superseded) and a revised
 *              plan is created APPROVED, with `revisionOfId` pointing at it.
 * AMENDMENT:   the source plan is paid. It is never modified or recharged. On approval a
 *              supplementary plan covering only failed or short-delivered quantity is created
 *              APPROVED and needs its own PayPal payment.
 * Simulations are validated and compared but can never be submitted or committed.
 */

type ProposalScenario = {
  demand: DemandLine[];
  excludeOfferIds: string[];
  offerOverrides: Record<string, OfferOverride>;
  amendedDeliveryIds: string[];
  derivedFrom: string[];
};

export type CheckStatus = "PASS" | "WARN" | "FAIL";
export type Check = {
  code: string;
  status: CheckStatus;
  category: "VERSION" | "INFEASIBLE" | "STALE" | "INFO";
  message: string;
  expected?: string;
  actual?: string;
};

type Outcome =
  | "VALIDATED"
  | "VALIDATED_WITH_WARNINGS"
  | "REJECTED_INFEASIBLE"
  | "REJECTED_STALE_DATA"
  | "REJECTED_VERSION_CONFLICT"
  | "REQUIRES_HUMAN_REVIEW";

const REJECTIONS: Outcome[] = ["REJECTED_INFEASIBLE", "REJECTED_STALE_DATA", "REJECTED_VERSION_CONFLICT"];
const OPEN_PROPOSAL = ["DRAFT", "VALIDATED", "VALIDATED_WITH_WARNINGS", "REQUIRES_HUMAN_REVIEW", "PENDING_APPROVAL"] as const;
const ACTIVE_PAYMENT = ["PENDING", "APPROVED", "PROCESSING"];
const REPLACEABLE = ["DRAFT", "ANALYZING", "PENDING_APPROVAL", "APPROVED"];

const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

const loadPlan = (id: string) =>
  prisma.procurementPlan.findUnique({
    where: { id },
    include: {
      ...planInclude,
      items: {
        include: {
          product: true,
          purchases: { include: { vendorOffer: { include: { vendor: true, product: true } }, deliveries: true } },
          allocations: { include: { organization: true, reliefRequest: true, deliveries: true } },
        },
      },
    },
  });
type LoadedPlan = NonNullable<Awaited<ReturnType<typeof loadPlan>>>;

const isPaid = (plan: LoadedPlan) => plan.payments.some((p) => p.status === "COMPLETED");

/* ------------------------------------------------------------------ generate */

export type GenerateInput = {
  sourcePlanId: string;
  failureEventId?: string;
  budget?: number;
  maxDeliveryDays?: number;
  scenario?: { excludeOfferIds?: string[]; offerOverrides?: Record<string, OfferOverride> };
  rationale?: string;
  createdBy: string;
  workflowId?: string;
  idempotencyKey?: string;
};

export const generateProposal = async (input: GenerateInput) => {
  if (input.idempotencyKey) {
    const existing = await prisma.replanningProposal.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return { proposal: existing, replayed: true };
  }

  const plan = await loadPlan(input.sourcePlanId);
  if (!plan) throw new Error("PLAN_NOT_FOUND");
  if (plan.payments.some((p) => ACTIVE_PAYMENT.includes(p.status))) throw new Error("PAYMENT_IN_PROGRESS");

  const paid = isPaid(plan);
  const mode = paid ? "AMENDMENT" : "REPLACEMENT";
  if (!paid && !REPLACEABLE.includes(plan.status)) throw new Error("PLAN_NOT_REPLANNABLE");
  if (paid && !["ORDERED", "COMPLETED", "APPROVED"].includes(plan.status)) throw new Error("PLAN_NOT_REPLANNABLE");

  const event = input.failureEventId
    ? await prisma.supplierFailureEvent.findUnique({ where: { id: input.failureEventId }, include: { vendor: { include: { offers: true } } } })
    : null;
  if (input.failureEventId && !event) throw new Error("FAILURE_EVENT_NOT_FOUND");

  const userScenario = Boolean(input.scenario?.excludeOfferIds?.length || Object.keys(input.scenario?.offerOverrides ?? {}).length);
  const isSimulation = event?.isSimulation ?? userScenario;
  if (event && !event.isSimulation && userScenario) throw new Error("SCENARIO_OVERRIDES_REQUIRE_SIMULATION");

  const scenario: ProposalScenario = {
    demand: [],
    excludeOfferIds: [...(input.scenario?.excludeOfferIds ?? [])],
    offerOverrides: { ...(input.scenario?.offerOverrides ?? {}) },
    amendedDeliveryIds: [],
    derivedFrom: userScenario ? ["what-if overrides"] : [],
  };

  // A simulated event's effect is applied in memory only.
  if (event?.isSimulation) {
    const offerIds = event.vendorOfferId ? [event.vendorOfferId] : event.vendor.offers.map((o) => o.id);
    switch (event.type) {
      case "CAPACITY_REDUCED":
      case "INSUFFICIENT_STOCK":
        for (const id of offerIds) scenario.offerOverrides[id] = { ...scenario.offerOverrides[id], capacity: event.reportedCapacity ?? 0 };
        break;
      case "PRICE_CHANGED":
        if (event.reportedUnitPrice)
          for (const id of offerIds) scenario.offerOverrides[id] = { ...scenario.offerOverrides[id], unitPrice: event.reportedUnitPrice.toFixed(2) };
        break;
      case "DELIVERY_DELAYED":
        if (event.reportedDeliveryDays)
          for (const id of offerIds) scenario.offerOverrides[id] = { ...scenario.offerOverrides[id], deliveryDays: event.reportedDeliveryDays };
        break;
      case "SUPPLIER_UNAVAILABLE":
      case "ORDER_CANCELLED":
      case "OFFER_EXPIRED":
        scenario.excludeOfferIds.push(...offerIds);
        break;
      default:
        break;
    }
    scenario.derivedFrom.push(`simulated ${event.type}`);
  }

  if (mode === "REPLACEMENT") {
    const perRequest = new Map<string, number>();
    for (const item of plan.items)
      for (const allocation of item.allocations)
        if (allocation.reliefRequestId && allocation.quantity > 0)
          perRequest.set(allocation.reliefRequestId, (perRequest.get(allocation.reliefRequestId) ?? 0) + allocation.quantity);
    scenario.demand = [...perRequest].map(([requestId, quantity]) => ({ requestId, quantity }));
  } else {
    // Amendment: only quantities with persisted evidence of non-delivery (FAILED or short-delivered),
    // excluding deliveries already covered by an approved amendment.
    const approved = await prisma.replanningProposal.findMany({
      where: { sourcePlanId: plan.id, status: "APPROVED", mode: "AMENDMENT" },
      select: { scenario: true },
    });
    const alreadyAmended = new Set(approved.flatMap((p) => ((p.scenario as ProposalScenario).amendedDeliveryIds ?? [])));
    const perRequest = new Map<string, number>();
    const failingOffers = new Set<string>();
    for (const item of plan.items)
      for (const allocation of item.allocations)
        for (const delivery of allocation.deliveries) {
          const shortfall = delivery.quantity - delivery.deliveredQuantity;
          const evidenced = delivery.status === "FAILED" || (delivery.status === "DELIVERED" && shortfall > 0);
          if (!evidenced || shortfall <= 0 || alreadyAmended.has(delivery.id) || !allocation.reliefRequestId) continue;
          perRequest.set(allocation.reliefRequestId, (perRequest.get(allocation.reliefRequestId) ?? 0) + shortfall);
          scenario.amendedDeliveryIds.push(delivery.id);
          const purchase = item.purchases.find((p) => p.id === delivery.procurementPurchaseId);
          if (purchase) failingOffers.add(purchase.vendorOfferId);
        }
    if (perRequest.size === 0) throw new Error("NO_EVIDENCED_SHORTFALL");
    scenario.demand = [...perRequest].map(([requestId, quantity]) => ({ requestId, quantity }));
    scenario.excludeOfferIds.push(...failingOffers);
    scenario.derivedFrom.push("failed or short-delivered quantities");
  }
  scenario.excludeOfferIds = [...new Set(scenario.excludeOfferIds)];
  if (scenario.demand.length === 0) throw new Error("NO_DEMAND_IN_PLAN");

  const remaining = Number(plan.totalBudget.toString()) - Number(plan.totalCost.toString());
  const budget = input.budget ?? (mode === "REPLACEMENT" ? Number(plan.totalBudget.toString()) : remaining);
  if (!(budget > 0)) throw new Error("BUDGET_REQUIRED");

  const candidate = await optimizeProcurement({
    emergencyId: plan.emergencyId,
    budget,
    maxDeliveryDays: input.maxDeliveryDays,
    demand: scenario.demand,
    scenario: { excludeOfferIds: scenario.excludeOfferIds, offerOverrides: scenario.offerOverrides },
  });

  const comparison = compare(plan, candidate, mode, scenario);

  return prisma.$transaction(async (tx) => {
    const proposal = await tx.replanningProposal.create({
      data: {
        workflowId: input.workflowId,
        mode,
        status: "DRAFT",
        sourcePlanId: plan.id,
        sourcePlanVersion: plan.version,
        failureEventId: event?.id,
        isSimulation,
        budget: budget.toFixed(2),
        maxDeliveryDays: input.maxDeliveryDays,
        scenario: json(scenario),
        candidate: json(candidate),
        comparison: json(comparison),
        inputFingerprint: candidate.inputFingerprint,
        rationale: input.rationale,
        createdBy: input.createdBy,
        idempotencyKey: input.idempotencyKey,
      },
    });
    await tx.auditLog.create({
      data: {
        action: isSimulation ? "REPLANNING_PROPOSAL_SIMULATED" : "REPLANNING_PROPOSAL_CREATED",
        entityType: "ReplanningProposal",
        entityId: proposal.id,
        details: json({
          sourcePlanId: plan.id, sourcePlanVersion: plan.version, mode, isSimulation,
          failureEventId: event?.id ?? null, feasible: candidate.feasible,
          revisedCost: candidate.estimatedCost, costDelta: comparison.costDelta, createdBy: input.createdBy,
        }) as Prisma.InputJsonObject,
      },
    });
    return { proposal, replayed: false };
  });
};

/* ------------------------------------------------------------------ comparison */

const compare = (plan: LoadedPlan, candidate: OptimizationResult, mode: "REPLACEMENT" | "AMENDMENT", scenario: ProposalScenario) => {
  const originalLines = plan.items.flatMap((item) =>
    item.purchases
      .filter((p) => mode === "REPLACEMENT" || p.deliveries.some((d) => scenario.amendedDeliveryIds.includes(d.id)))
      .map((p) => {
        const affected =
          mode === "REPLACEMENT"
            ? p.quantity
            : p.deliveries.filter((d) => scenario.amendedDeliveryIds.includes(d.id)).reduce((s, d) => s + d.quantity - d.deliveredQuantity, 0);
        return {
          productName: item.product.name,
          vendorName: p.vendorOffer.vendor.name,
          offerId: p.vendorOfferId,
          quantity: affected,
          unitPrice: p.unitPrice.toString(),
          lineTotal: (affected * Number(p.unitPrice.toString())).toFixed(2),
          deliveryDays: p.deliveryDays,
        };
      })
  );
  const revisedLines = candidate.supplierPurchases.map((p) => ({
    productName: p.productName, vendorName: p.vendorName, offerId: p.offerId, quantity: p.quantity,
    unitPrice: p.unitPrice, lineTotal: p.totalAmount, deliveryDays: p.deliveryDays,
  }));
  const sum = (lines: { lineTotal: string }[]) => lines.reduce((s, l) => s + Number(l.lineTotal), 0);
  const originalCost = mode === "REPLACEMENT" ? Number(plan.totalCost.toString()) : sum(originalLines);
  const revisedCost = Number(candidate.estimatedCost);
  const vendors = (lines: { vendorName: string }[]) => [...new Set(lines.map((l) => l.vendorName))];
  const maxDays = (lines: { deliveryDays: number }[]) => (lines.length ? Math.max(...lines.map((l) => l.deliveryDays)) : null);
  return {
    mode,
    scope: mode === "REPLACEMENT" ? "Whole plan" : "Failed or short-delivered quantity only",
    originalCost: originalCost.toFixed(2),
    revisedCost: revisedCost.toFixed(2),
    costDelta: (revisedCost - originalCost).toFixed(2),
    originalQuantity: originalLines.reduce((s, l) => s + l.quantity, 0),
    revisedQuantity: candidate.fulfillment.fulfilledQuantity,
    demandQuantity: candidate.fulfillment.totalDemand,
    revisedCoverage: candidate.fulfillment.fulfillmentPercentage,
    unmetQuantity: candidate.fulfillment.unfulfilledQuantity,
    originalSuppliers: vendors(originalLines),
    revisedSuppliers: vendors(revisedLines),
    suppliersAdded: vendors(revisedLines).filter((v) => !vendors(originalLines).includes(v)),
    suppliersRemoved: vendors(originalLines).filter((v) => !vendors(revisedLines).includes(v)),
    originalMaxDeliveryDays: maxDays(originalLines),
    revisedMaxDeliveryDays: maxDays(revisedLines),
    budget: candidate.budget,
    remainingBudgetAfter: candidate.remainingBudget,
    originalLines,
    revisedLines,
  };
};

/* ------------------------------------------------------------------ validation */

/**
 * Authoritative, independent recomputation from FRESH data. Used for every validation report and
 * again at approval time, so a proposal can never be committed against changed inputs.
 */
export const computeValidation = async (proposalId: string) => {
  const proposal = await prisma.replanningProposal.findUnique({ where: { id: proposalId } });
  if (!proposal) throw new Error("PROPOSAL_NOT_FOUND");
  const plan = await loadPlan(proposal.sourcePlanId);
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);
  const scenario = proposal.scenario as unknown as ProposalScenario;
  const candidate = proposal.candidate as unknown as OptimizationResult;

  if (!plan) {
    add({ code: "SOURCE_PLAN_EXISTS", status: "FAIL", category: "VERSION", message: "Source plan no longer exists." });
    return { outcome: "REJECTED_VERSION_CONFLICT" as Outcome, checks, fresh: null };
  }
  add({
    code: "PLAN_VERSION",
    status: plan.version === proposal.sourcePlanVersion ? "PASS" : "FAIL",
    category: "VERSION",
    message: plan.version === proposal.sourcePlanVersion ? "Source plan unchanged since the proposal." : "Source plan changed after the proposal was generated.",
    expected: String(proposal.sourcePlanVersion),
    actual: String(plan.version),
  });
  const stateOk =
    proposal.mode === "REPLACEMENT"
      ? REPLACEABLE.includes(plan.status) && !plan.payments.some((p) => p.status === "COMPLETED" || ACTIVE_PAYMENT.includes(p.status))
      : isPaid(plan);
  add({
    code: "PLAN_STATE",
    status: stateOk ? "PASS" : "FAIL",
    category: "VERSION",
    message: stateOk ? `Plan state ${plan.status} allows a ${proposal.mode.toLowerCase()}.` : `Plan state ${plan.status} (or its payments) no longer allows a ${proposal.mode.toLowerCase()}.`,
  });

  add({
    code: "CANDIDATE_FEASIBLE",
    status: candidate.feasible ? "PASS" : "FAIL",
    category: "INFEASIBLE",
    message: candidate.feasible
      ? "Proposed plan covers all demand within budget."
      : `Proposed plan is infeasible: ${candidate.budgetFeasible ? "" : "over budget; "}${candidate.constraints.supplierCapacitySufficient ? "" : `${candidate.fulfillment.unfulfilledQuantity} units unmet`}`.trim(),
  });

  let fresh: OptimizationResult | null = null;
  try {
    fresh = await optimizeProcurement({
      emergencyId: plan.emergencyId,
      budget: Number(proposal.budget.toString()),
      maxDeliveryDays: proposal.maxDeliveryDays ?? undefined,
      demand: scenario.demand,
      scenario: { excludeOfferIds: scenario.excludeOfferIds, offerOverrides: scenario.offerOverrides },
    });
  } catch (error) {
    add({ code: "FRESH_OPTIMIZATION", status: "FAIL", category: "INFEASIBLE", message: `Fresh optimization failed: ${error instanceof Error ? error.message : "error"}` });
  }

  if (fresh) {
    add({
      code: "FRESH_FEASIBLE",
      status: fresh.feasible ? "PASS" : "FAIL",
      category: "INFEASIBLE",
      message: fresh.feasible ? "Independent re-optimization on fresh data is feasible." : "Independent re-optimization on fresh data is infeasible.",
    });

    // Every proposed purchase must still be buyable at the proposed price, quantity and lead time.
    const offers = await prisma.vendorOffer.findMany({ where: { id: { in: candidate.supplierPurchases.map((p) => p.offerId) } }, include: { vendor: true } });
    for (const purchase of candidate.supplierPurchases) {
      const stored = offers.find((o) => o.id === purchase.offerId);
      const o = scenario.offerOverrides[purchase.offerId] ?? {};
      const label = `${purchase.vendorName} · ${purchase.productName}`;
      if (!stored) {
        add({ code: "OFFER_EXISTS", status: "FAIL", category: "STALE", message: `${label}: offer no longer exists.` });
        continue;
      }
      const available = o.isAvailable ?? stored.isAvailable;
      const expired = stored.validUntil !== null && stored.validUntil.getTime() < Date.now();
      add({ code: "SUPPLIER_AVAILABLE", status: available && !expired ? "PASS" : "FAIL", category: "STALE", message: `${label}: ${available ? (expired ? "offer expired" : "available") : "unavailable"}.` });
      const capacity = o.capacity ?? stored.capacity;
      add({ code: "CAPACITY", status: capacity >= purchase.quantity ? "PASS" : "FAIL", category: "STALE", message: `${label}: capacity ${capacity} for ${purchase.quantity}.`, expected: `≥ ${purchase.quantity}`, actual: String(capacity) });
      const price = o.unitPrice ?? stored.unitPrice.toFixed(2);
      add({ code: "PRICE_UNCHANGED", status: Number(price) === Number(purchase.unitPrice) ? "PASS" : "FAIL", category: "STALE", message: `${label}: price ${purchase.unitPrice} → now ${price}.`, expected: purchase.unitPrice, actual: price });
      const days = o.deliveryDays ?? stored.deliveryDays;
      const within = proposal.maxDeliveryDays === null || days <= proposal.maxDeliveryDays;
      add({ code: "DELIVERY_CONSTRAINT", status: within ? "PASS" : "FAIL", category: "STALE", message: `${label}: ${days} day(s)${proposal.maxDeliveryDays ? ` (limit ${proposal.maxDeliveryDays})` : ""}.` });
    }

    // Quantity accounting: every affected unit is purchased and allocated exactly once.
    const demandTotal = scenario.demand.reduce((s, d) => s + d.quantity, 0);
    const purchased = candidate.supplierPurchases.reduce((s, p) => s + p.quantity, 0);
    const allocated = candidate.ngoAllocations.reduce((s, a) => s + a.allocatedQuantity, 0);
    add({
      code: "QUANTITY_ACCOUNTED",
      status: purchased === demandTotal && allocated === demandTotal ? "PASS" : "FAIL",
      category: "INFEASIBLE",
      message: `Demand ${demandTotal}, purchased ${purchased}, allocated ${allocated}.`,
    });
    const overAllocated = candidate.ngoAllocations.filter((a) => a.allocatedQuantity > a.requestedQuantity);
    add({
      code: "NGO_ALLOCATION_CONSISTENT",
      status: overAllocated.length === 0 ? "PASS" : "FAIL",
      category: "INFEASIBLE",
      message: overAllocated.length === 0 ? "No NGO receives more than requested." : `${overAllocated.length} NGO allocation(s) exceed their request.`,
    });
    add({
      code: "BUDGET",
      status: Number(candidate.estimatedCost) <= Number(proposal.budget.toString()) ? "PASS" : "FAIL",
      category: "INFEASIBLE",
      message: `Cost ${candidate.estimatedCost} within budget ${proposal.budget.toFixed(2)}.`,
    });

    const key = (r: OptimizationResult) => r.supplierPurchases.map((p) => `${p.offerId}:${p.quantity}:${p.unitPrice}`).sort().join("|");
    const sameResult = key(fresh) === key(candidate);
    add({
      code: "RESULT_REPRODUCIBLE",
      status: sameResult ? "PASS" : "FAIL",
      category: "STALE",
      message: sameResult ? "Fresh optimization reproduces the proposed purchases exactly." : "Fresh optimization selects different purchases: the proposal is based on stale inputs.",
    });
    add({
      code: "INPUT_SNAPSHOT",
      status: fresh.inputFingerprint === proposal.inputFingerprint ? "PASS" : sameResult ? "WARN" : "FAIL",
      category: "STALE",
      message: fresh.inputFingerprint === proposal.inputFingerprint ? "Inputs identical to the proposal snapshot." : "Inputs changed since the proposal snapshot.",
    });
  }

  const comparison = proposal.comparison as { costDelta?: string; originalMaxDeliveryDays?: number | null; revisedMaxDeliveryDays?: number | null };
  if (Number(comparison.costDelta ?? 0) > 0)
    add({ code: "COST_INCREASE", status: "WARN", category: "INFO", message: `Revised plan costs ₹${comparison.costDelta} more.` });
  if (comparison.originalMaxDeliveryDays != null && comparison.revisedMaxDeliveryDays != null && comparison.revisedMaxDeliveryDays > comparison.originalMaxDeliveryDays)
    add({ code: "DELIVERY_SLOWER", status: "WARN", category: "INFO", message: `Slowest delivery ${comparison.originalMaxDeliveryDays} → ${comparison.revisedMaxDeliveryDays} days.` });
  if (proposal.isSimulation)
    add({ code: "SIMULATION", status: "WARN", category: "INFO", message: "Simulation: for comparison only, cannot be submitted or committed." });

  const failed = checks.filter((c) => c.status === "FAIL");
  const outcome: Outcome = failed.some((c) => c.category === "VERSION")
    ? "REJECTED_VERSION_CONFLICT"
    : failed.some((c) => c.category === "INFEASIBLE")
      ? "REJECTED_INFEASIBLE"
      : failed.length
        ? "REJECTED_STALE_DATA"
        : checks.some((c) => c.status === "WARN")
          ? "VALIDATED_WITH_WARNINGS"
          : "VALIDATED";

  return { outcome, checks, fresh };
};

export type RecordValidationInput = {
  proposalId: string;
  validator: string;
  workflowId?: string;
  agentOutcome?: Outcome;
  agentChecks?: unknown[];
};

/**
 * Store a validation report. The server's own recomputation decides rejections; if the independent
 * Revalidation Agent disagrees with a passing server result, the proposal escalates to human review.
 */
export const recordValidation = async (input: RecordValidationInput) => {
  const proposal = await prisma.replanningProposal.findUnique({ where: { id: input.proposalId } });
  if (!proposal) throw new Error("PROPOSAL_NOT_FOUND");
  if (!["DRAFT", "VALIDATED", "VALIDATED_WITH_WARNINGS", "REQUIRES_HUMAN_REVIEW", ...REJECTIONS].includes(proposal.status)) {
    throw new Error("PROPOSAL_ALREADY_DECIDED");
  }

  const server = await computeValidation(input.proposalId);
  let outcome: Outcome = server.outcome;
  if (!REJECTIONS.includes(server.outcome) && input.agentOutcome && input.agentOutcome !== "VALIDATED" && input.agentOutcome !== server.outcome) {
    outcome = "REQUIRES_HUMAN_REVIEW";
  }

  return prisma.$transaction(async (tx) => {
    const report = await tx.validationReport.create({
      data: {
        proposalId: proposal.id,
        workflowId: input.workflowId,
        outcome,
        agentOutcome: input.agentOutcome,
        validator: input.validator,
        checks: json({ server: server.checks, agent: input.agentChecks ?? [] }),
        recomputed: server.fresh
          ? json({
              estimatedCost: server.fresh.estimatedCost,
              feasible: server.fresh.feasible,
              fulfillment: server.fresh.fulfillment,
              purchases: server.fresh.supplierPurchases.map((p) => ({ vendorName: p.vendorName, productName: p.productName, quantity: p.quantity, unitPrice: p.unitPrice })),
            })
          : undefined,
        inputFingerprint: server.fresh?.inputFingerprint ?? "unavailable",
      },
    });
    await tx.replanningProposal.update({ where: { id: proposal.id }, data: { status: outcome } });
    await tx.auditLog.create({
      data: {
        action: "REPLANNING_PROPOSAL_VALIDATED",
        entityType: "ReplanningProposal",
        entityId: proposal.id,
        details: json({ reportId: report.id, outcome, serverOutcome: server.outcome, agentOutcome: input.agentOutcome ?? null, validator: input.validator }) as Prisma.InputJsonObject,
      },
    });
    return { report, outcome, serverOutcome: server.outcome };
  });
};

/* ------------------------------------------------------------------ submit / decide */

export const submitProposalForApproval = async (proposalId: string, submittedBy: string) => {
  const proposal = await prisma.replanningProposal.findUnique({
    where: { id: proposalId },
    include: { validations: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!proposal) throw new Error("PROPOSAL_NOT_FOUND");
  if (proposal.isSimulation) throw new Error("SIMULATION_CANNOT_BE_SUBMITTED");
  const latest = proposal.validations[0];
  if (!latest) throw new Error("PROPOSAL_NOT_VALIDATED");
  if (!["VALIDATED", "VALIDATED_WITH_WARNINGS", "REQUIRES_HUMAN_REVIEW"].includes(proposal.status) || REJECTIONS.includes(latest.outcome)) {
    throw new Error("PROPOSAL_NOT_VALIDATED");
  }
  return prisma.$transaction(async (tx) => {
    const updated = await tx.replanningProposal.update({ where: { id: proposalId }, data: { status: "PENDING_APPROVAL" } });
    await tx.auditLog.create({
      data: { action: "REPLANNING_PROPOSAL_SUBMITTED", entityType: "ReplanningProposal", entityId: proposalId, details: { submittedBy, validationOutcome: latest.outcome } },
    });
    return updated;
  });
};

export const decideProposal = async (input: { proposalId: string; approved: boolean; decidedBy: string; comment?: string }) => {
  const proposal = await prisma.replanningProposal.findUnique({ where: { id: input.proposalId } });
  if (!proposal) throw new Error("PROPOSAL_NOT_FOUND");
  if (proposal.status !== "PENDING_APPROVAL") throw new Error("PROPOSAL_NOT_PENDING");
  if (proposal.isSimulation) throw new Error("SIMULATION_CANNOT_BE_COMMITTED");

  if (!input.approved) {
    if (!input.comment?.trim()) throw new Error("REJECTION_REASON_REQUIRED");
    return prisma.$transaction(async (tx) => {
      const updated = await tx.replanningProposal.update({
        where: { id: proposal.id },
        data: { status: "REJECTED", decidedBy: input.decidedBy, decisionComment: input.comment!.trim(), decidedAt: new Date() },
      });
      await tx.auditLog.create({
        data: { action: "REPLANNING_PROPOSAL_REJECTED", entityType: "ReplanningProposal", entityId: proposal.id, details: { decidedBy: input.decidedBy, reason: input.comment!.trim() } },
      });
      return { proposal: updated, committedPlan: null };
    });
  }

  // Re-validate on fresh data at the moment of approval.
  const check = await computeValidation(proposal.id);
  if (REJECTIONS.includes(check.outcome) || !check.fresh) {
    await prisma.$transaction(async (tx) => {
      await tx.validationReport.create({
        data: {
          proposalId: proposal.id, outcome: check.outcome, validator: "server-at-approval",
          checks: json({ server: check.checks, agent: [] }), inputFingerprint: check.fresh?.inputFingerprint ?? "unavailable",
        },
      });
      await tx.replanningProposal.update({ where: { id: proposal.id }, data: { status: check.outcome } });
    });
    throw new Error("PROPOSAL_NO_LONGER_VALID");
  }
  const fresh = check.fresh;
  const scenario = proposal.scenario as unknown as ProposalScenario;

  return prisma.$transaction(async (tx) => {
    // Optimistic concurrency: the source plan must still be at the proposal's version.
    const bumped = await tx.procurementPlan.updateMany({
      where: { id: proposal.sourcePlanId, version: proposal.sourcePlanVersion },
      data: proposal.mode === "REPLACEMENT"
        ? { version: { increment: 1 }, status: "CANCELLED", explanation: `Superseded by approved replanning proposal ${proposal.id}.` }
        : { version: { increment: 1 } },
    });
    if (bumped.count !== 1) throw new Error("PLAN_VERSION_CONFLICT");

    const source = await tx.procurementPlan.findUniqueOrThrow({ where: { id: proposal.sourcePlanId } });
    const committed = await persistOptimizedPlan(tx, {
      emergencyId: source.emergencyId,
      budget: Number(proposal.budget.toString()),
      result: fresh,
      name: `${fresh.emergency.name} ${proposal.mode === "REPLACEMENT" ? "Revised" : "Supplementary"} Plan`,
      explanation:
        proposal.mode === "REPLACEMENT"
          ? `Revision of plan ${source.id} (v${proposal.sourcePlanVersion}) via proposal ${proposal.id}, approved by ${input.decidedBy}.`
          : `Amendment to paid plan ${source.id} covering failed or short-delivered quantity, via proposal ${proposal.id}, approved by ${input.decidedBy}. Requires its own payment; the original payment is untouched.`,
      status: "APPROVED",
      revisionOfId: source.id,
      approvedBy: input.decidedBy,
      approvalComment: input.comment,
      auditAction: "PROCUREMENT_PLAN_REVISION_COMMITTED",
      auditDetails: { proposalId: proposal.id, mode: proposal.mode, amendedDeliveryIds: scenario.amendedDeliveryIds },
    });

    const updated = await tx.replanningProposal.update({
      where: { id: proposal.id },
      data: { status: "APPROVED", decidedBy: input.decidedBy, decisionComment: input.comment ?? null, decidedAt: new Date(), committedPlanId: committed.id },
    });
    await tx.replanningProposal.updateMany({
      where: { sourcePlanId: proposal.sourcePlanId, id: { not: proposal.id }, status: { in: [...OPEN_PROPOSAL] } },
      data: { status: "SUPERSEDED" },
    });
    await tx.auditLog.create({
      data: {
        action: "REPLANNING_PROPOSAL_APPROVED",
        entityType: "ReplanningProposal",
        entityId: proposal.id,
        details: { decidedBy: input.decidedBy, mode: proposal.mode, sourcePlanId: proposal.sourcePlanId, committedPlanId: committed.id, cost: fresh.estimatedCost },
      },
    });
    return { proposal: updated, committedPlan: committed };
  });
};

/* ------------------------------------------------------------------ reads */

export const listProposals = (filters: { sourcePlanId?: string; status?: string }) =>
  prisma.replanningProposal.findMany({
    where: {
      ...(filters.sourcePlanId && { sourcePlanId: filters.sourcePlanId }),
      ...(filters.status && { status: filters.status as never }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      sourcePlan: { select: { id: true, name: true, status: true, version: true, totalCost: true, emergencyId: true } },
      failureEvent: { select: { id: true, type: true, isSimulation: true, reason: true, vendor: { select: { name: true } } } },
      validations: { orderBy: { createdAt: "desc" } },
      committedPlan: { select: { id: true, name: true, status: true } },
    },
  });

export const getProposal = (id: string) =>
  prisma.replanningProposal.findUnique({
    where: { id },
    include: {
      sourcePlan: { select: { id: true, name: true, status: true, version: true, totalCost: true, totalBudget: true, emergencyId: true } },
      failureEvent: { include: { vendor: { select: { name: true } } } },
      validations: { orderBy: { createdAt: "desc" } },
      committedPlan: { select: { id: true, name: true, status: true } },
    },
  });
