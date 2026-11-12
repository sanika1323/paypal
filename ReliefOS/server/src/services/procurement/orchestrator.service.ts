import { prisma } from "../../config/database.js";

import { runDemandAgent } from "./demand-agent.service.js";
import { runSupplierAgent } from "./supplier-agent.service.js";
import { runAllocationAgent } from "./allocation-agent.service.js";
import { runFulfilmentAgent } from "./fulfilment-agent.service.js";
import { Prisma } from "../../generated/prisma/client.js";

type OrchestratorInput = {
  emergencyId: string;
  budget: number;
  maxDeliveryDays?: number;
};

type StageStatus = "COMPLETED" | "FAILED" | "SKIPPED";

type StageResult = {
  agent: string;
  status: StageStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  error?: string;
  summary?: unknown;
};

const executeStage = async <T>(
  agent: string,
  execute: () => Promise<T>,
  summarize: (result: T) => unknown
): Promise<{ result: T | null; stage: StageResult }> => {
  const started = Date.now();
  const startedAt = new Date(started).toISOString();

  try {
    const result = await execute();
    const completed = Date.now();

    return {
      result,
      stage: {
        agent,
        status: "COMPLETED",
        startedAt,
        completedAt: new Date(completed).toISOString(),
        durationMs: completed - started,
        summary: summarize(result),
      },
    };
  } catch (error) {
    const completed = Date.now();

    return {
      result: null,
      stage: {
        agent,
        status: "FAILED",
        startedAt,
        completedAt: new Date(completed).toISOString(),
        durationMs: completed - started,
        error:
          error instanceof Error
            ? error.message
            : "Unknown agent execution error",
      },
    };
  }
};

const skippedStage = (agent: string, reason: string): StageResult => {
  const now = new Date().toISOString();

  return {
    agent,
    status: "SKIPPED",
    startedAt: now,
    completedAt: now,
    durationMs: 0,
    error: reason,
  };
};

export const runProcurementOrchestrator = async (
  input: OrchestratorInput
) => {
  const workflowStartedAt = new Date().toISOString();
  const workflowStarted = Date.now();

  const stages: StageResult[] = [];

  // Stage 1: Consolidate NGO demand.
  const demandExecution = await executeStage(
    "DEMAND_AGENT",
    () =>
      runDemandAgent({
        emergencyId: input.emergencyId,
      }),
    (result) => result.summary
  );

  stages.push(demandExecution.stage);

  // Stage 2: Evaluate actual supplier offers.
  let supplierExecution:
    Awaited<ReturnType<typeof runSupplierAgent>> | null = null;

  if (demandExecution.result) {
    const execution = await executeStage(
      "SUPPLIER_AGENT",
      () =>
        runSupplierAgent({
          emergencyId: input.emergencyId,
        }),
      (result) => result.summary
    );

    supplierExecution = execution.result;
    stages.push(execution.stage);
  } else {
    stages.push(
      skippedStage(
        "SUPPLIER_AGENT",
        "Skipped because Demand Agent failed."
      )
    );
  }

  // Stage 3: Generate the deterministic allocation preview.
  let allocationExecution:
    Awaited<ReturnType<typeof runAllocationAgent>> | null = null;

  if (supplierExecution) {
    const execution = await executeStage(
      "ALLOCATION_AGENT",
      () =>
        runAllocationAgent({
          emergencyId: input.emergencyId,
          budget: input.budget,
          maxDeliveryDays: input.maxDeliveryDays,
        }),
      (result) => ({
        decision: result.decision,
        feasible: result.allocation.feasible,
        estimatedCost: result.allocation.estimatedCost,
        remainingBudget: result.allocation.remainingBudget,
        fulfilledQuantity:
          result.allocation.fulfillment.fulfilledQuantity,
        unfulfilledQuantity:
          result.allocation.fulfillment.unfulfilledQuantity,
        isPreview: result.isPreview,
      })
    );

    allocationExecution = execution.result;
    stages.push(execution.stage);
  } else {
    stages.push(
      skippedStage(
        "ALLOCATION_AGENT",
        "Skipped because supplier evaluation did not complete."
      )
    );
  }

  // Stage 4: Inspect persisted plans and fulfilment records.
  // This stage is independent of the new allocation preview.
  const fulfilmentExecution = await executeStage(
    "FULFILMENT_AGENT",
    () =>
      runFulfilmentAgent({
        emergencyId: input.emergencyId,
      }),
    (result) => result.summary
  );

  stages.push(fulfilmentExecution.stage);

  const failedStages = stages.filter(
    (stage) => stage.status === "FAILED"
  );

  const skippedStages = stages.filter(
    (stage) => stage.status === "SKIPPED"
  );

  const overallStatus =
    failedStages.length === 0 && skippedStages.length === 0
      ? "COMPLETED"
      : "PARTIAL";

  const workflowCompletedAt = new Date().toISOString();

  const workflow = {
    workflow: "RELIEFOS_PROCUREMENT_ORCHESTRATOR",
    status: overallStatus,
    emergencyId: input.emergencyId,

    input: {
      budget: input.budget.toFixed(2),
      maxDeliveryDays: input.maxDeliveryDays ?? null,
    },

    execution: {
      startedAt: workflowStartedAt,
      completedAt: workflowCompletedAt,
      durationMs: Date.now() - workflowStarted,
      totalStages: stages.length,
      completedStages: stages.filter(
        (stage) => stage.status === "COMPLETED"
      ).length,
      failedStages: failedStages.length,
      skippedStages: skippedStages.length,
    },

    stages,

    results: {
      demand: demandExecution.result,
      suppliers: supplierExecution,
      allocationPreview: allocationExecution,
      existingFulfilmentState: fulfilmentExecution.result,
    },

    importantNotes: [
      "Allocation Agent produces a preview and does not create a procurement plan.",
      "Fulfilment Agent reads previously persisted plans and does not inspect the unsaved allocation preview as a plan.",
      "Human approval is required before procurement proceeds.",
      "No supplier inventory is reserved and no payment or delivery is created by this workflow.",
    ],
  };

  // Persist workflow history using the existing AuditLog model.
  let auditPersisted = false;
  let auditError: string | null = null;

  try {
    await prisma.auditLog.create({
      data: {
        action:
          overallStatus === "COMPLETED"
            ? "PROCUREMENT_ORCHESTRATION_COMPLETED"
            : "PROCUREMENT_ORCHESTRATION_PARTIAL",
        entityType: "Emergency",
        entityId: input.emergencyId,
        details: {
  workflow: workflow.workflow,
  status: workflow.status,
  input: {
    budget: workflow.input.budget,
    maxDeliveryDays: workflow.input.maxDeliveryDays,
  },
  execution: {
    startedAt: workflow.execution.startedAt,
    completedAt: workflow.execution.completedAt,
    durationMs: workflow.execution.durationMs,
    totalStages: workflow.execution.totalStages,
    completedStages: workflow.execution.completedStages,
    failedStages: workflow.execution.failedStages,
    skippedStages: workflow.execution.skippedStages,
  },
  stages: workflow.stages.map((stage) => ({
    agent: stage.agent,
    status: stage.status,
    startedAt: stage.startedAt,
    completedAt: stage.completedAt,
    durationMs: stage.durationMs,
    error: stage.error ?? null,
    summary: stage.summary
      ? JSON.parse(JSON.stringify(stage.summary))
      : null,
  })),
  allocationDecision:
    allocationExecution?.decision ?? null,
  allocationFeasible:
    allocationExecution?.allocation.feasible ?? null,
  allocationEstimatedCost:
    allocationExecution?.allocation.estimatedCost ?? null,
  fulfilmentSummary:
    fulfilmentExecution.result?.summary ?? null,
} satisfies Prisma.InputJsonObject,
      },
    });

    auditPersisted = true;
  } catch (error) {
    auditError =
      error instanceof Error
        ? error.message
        : "Failed to persist orchestration audit record";

    console.error("Orchestrator audit persistence failed:", error);
  }

  return {
    ...workflow,
    audit: {
      persisted: auditPersisted,
      error: auditError,
    },
  };
};