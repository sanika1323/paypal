-- ReliefOS 2.0: replanning, independent revalidation, agent workflows, delivery receipt, coordinates.
-- Additive only: new enums and tables, plus nullable or defaulted columns. Nothing is dropped or renamed.

-- CreateEnum
CREATE TYPE "SupplierFailureType" AS ENUM ('ORDER_CANCELLED', 'INSUFFICIENT_STOCK', 'CAPACITY_REDUCED', 'SUPPLIER_UNAVAILABLE', 'OFFER_EXPIRED', 'PRICE_CHANGED', 'DELIVERY_DELAYED', 'WHAT_IF_SCENARIO');

-- CreateEnum
CREATE TYPE "ProposalMode" AS ENUM ('REPLACEMENT', 'AMENDMENT');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'VALIDATED', 'VALIDATED_WITH_WARNINGS', 'REQUIRES_HUMAN_REVIEW', 'REJECTED_INFEASIBLE', 'REJECTED_STALE_DATA', 'REJECTED_VERSION_CONFLICT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ValidationOutcome" AS ENUM ('VALIDATED', 'VALIDATED_WITH_WARNINGS', 'REJECTED_INFEASIBLE', 'REJECTED_STALE_DATA', 'REJECTED_VERSION_CONFLICT', 'REQUIRES_HUMAN_REVIEW');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('RUNNING', 'WAITING_FOR_HUMAN', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "StepKind" AS ENUM ('AI_REASONING', 'MCP_TOOL', 'DETERMINISTIC', 'PERSISTED_MUTATION', 'SIMULATION', 'HUMAN_ACTION');

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "delayReason" TEXT,
ADD COLUMN     "deliveredQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dispatchedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "receiptNotes" TEXT,
ADD COLUMN     "receivedAt" TIMESTAMP(3),
ADD COLUMN     "receivedBy" TEXT;

-- AlterTable
ALTER TABLE "Emergency" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProcurementPlan" ADD COLUMN     "revisionOfId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "VendorOffer" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "validUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SupplierFailureEvent" (
    "id" TEXT NOT NULL,
    "type" "SupplierFailureType" NOT NULL,
    "vendorId" TEXT NOT NULL,
    "vendorOfferId" TEXT,
    "planId" TEXT,
    "deliveryId" TEXT,
    "affectedQuantity" INTEGER,
    "reportedCapacity" INTEGER,
    "reportedUnitPrice" DECIMAL(12,2),
    "reportedDeliveryDays" INTEGER,
    "reason" TEXT NOT NULL,
    "isSimulation" BOOLEAN NOT NULL DEFAULT false,
    "reportedBy" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierFailureEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplanningProposal" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT,
    "mode" "ProposalMode" NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "sourcePlanId" TEXT NOT NULL,
    "sourcePlanVersion" INTEGER NOT NULL,
    "failureEventId" TEXT,
    "isSimulation" BOOLEAN NOT NULL DEFAULT false,
    "budget" DECIMAL(14,2) NOT NULL,
    "maxDeliveryDays" INTEGER,
    "scenario" JSONB NOT NULL,
    "candidate" JSONB NOT NULL,
    "comparison" JSONB NOT NULL,
    "inputFingerprint" TEXT NOT NULL,
    "rationale" TEXT,
    "createdBy" TEXT NOT NULL,
    "decidedBy" TEXT,
    "decisionComment" TEXT,
    "decidedAt" TIMESTAMP(3),
    "committedPlanId" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplanningProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationReport" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "workflowId" TEXT,
    "outcome" "ValidationOutcome" NOT NULL,
    "agentOutcome" "ValidationOutcome",
    "validator" TEXT NOT NULL,
    "checks" JSONB NOT NULL,
    "recomputed" JSONB,
    "inputFingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentWorkflow" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'RUNNING',
    "trigger" TEXT NOT NULL,
    "emergencyId" TEXT,
    "planId" TEXT,
    "proposalId" TEXT,
    "failureEventId" TEXT,
    "isSimulation" BOOLEAN NOT NULL DEFAULT false,
    "state" JSONB NOT NULL,
    "checkpoint" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentStep" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "agent" TEXT NOT NULL,
    "kind" "StepKind" NOT NULL,
    "tool" TEXT,
    "status" TEXT NOT NULL,
    "inputSummary" JSONB,
    "outputSummary" JSONB,
    "error" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "correlationId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierFailureEvent_idempotencyKey_key" ON "SupplierFailureEvent"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "ReplanningProposal_committedPlanId_key" ON "ReplanningProposal"("committedPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplanningProposal_idempotencyKey_key" ON "ReplanningProposal"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "AgentStep_workflowId_sequence_key" ON "AgentStep"("workflowId", "sequence");

-- AddForeignKey
ALTER TABLE "ProcurementPlan" ADD CONSTRAINT "ProcurementPlan_revisionOfId_fkey" FOREIGN KEY ("revisionOfId") REFERENCES "ProcurementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierFailureEvent" ADD CONSTRAINT "SupplierFailureEvent_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierFailureEvent" ADD CONSTRAINT "SupplierFailureEvent_vendorOfferId_fkey" FOREIGN KEY ("vendorOfferId") REFERENCES "VendorOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierFailureEvent" ADD CONSTRAINT "SupplierFailureEvent_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ProcurementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierFailureEvent" ADD CONSTRAINT "SupplierFailureEvent_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplanningProposal" ADD CONSTRAINT "ReplanningProposal_sourcePlanId_fkey" FOREIGN KEY ("sourcePlanId") REFERENCES "ProcurementPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplanningProposal" ADD CONSTRAINT "ReplanningProposal_committedPlanId_fkey" FOREIGN KEY ("committedPlanId") REFERENCES "ProcurementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplanningProposal" ADD CONSTRAINT "ReplanningProposal_failureEventId_fkey" FOREIGN KEY ("failureEventId") REFERENCES "SupplierFailureEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationReport" ADD CONSTRAINT "ValidationReport_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ReplanningProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentStep" ADD CONSTRAINT "AgentStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "AgentWorkflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
