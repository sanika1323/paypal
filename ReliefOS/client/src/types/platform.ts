// Shapes for the replanning, revalidation, workflow and analytics routes
// (server/src/controllers/{replanning,workflow,analytics,platform}.controller.ts).
import type { DecimalString, IsoDate, OptimizationResult, ProcurementStatus } from './api'

export type FailureType =
  | 'ORDER_CANCELLED'
  | 'INSUFFICIENT_STOCK'
  | 'CAPACITY_REDUCED'
  | 'SUPPLIER_UNAVAILABLE'
  | 'OFFER_EXPIRED'
  | 'PRICE_CHANGED'
  | 'DELIVERY_DELAYED'
  | 'WHAT_IF_SCENARIO'

export const FAILURE_TYPES: FailureType[] = [
  'SUPPLIER_UNAVAILABLE',
  'ORDER_CANCELLED',
  'INSUFFICIENT_STOCK',
  'CAPACITY_REDUCED',
  'PRICE_CHANGED',
  'OFFER_EXPIRED',
  'DELIVERY_DELAYED',
  'WHAT_IF_SCENARIO',
]

export interface SupplierFailure {
  id: string
  type: FailureType
  vendorId: string
  vendorOfferId: string | null
  planId: string | null
  deliveryId: string | null
  affectedQuantity: number | null
  reportedCapacity: number | null
  reportedUnitPrice: DecimalString | null
  reportedDeliveryDays: number | null
  reason: string
  isSimulation: boolean
  reportedBy: string
  createdAt: IsoDate
  vendor: { id: string; name: string; location: string }
  vendorOffer: { id: string; product: { id: string; name: string; unit: string } } | null
  plan: { id: string; name: string; status: ProcurementStatus; version: number } | null
  delivery: { id: string; trackingRef: string | null; status: string; quantity: number } | null
  proposals: Array<{ id: string; status: ProposalStatus; mode: ProposalMode; createdAt: IsoDate }>
}

export interface ReportFailureInput {
  type: FailureType
  vendorId: string
  vendorOfferId?: string
  planId?: string
  deliveryId?: string
  reportedCapacity?: number
  reportedUnitPrice?: string
  reportedDeliveryDays?: number
  reason: string
  isSimulation: boolean
  reportedBy: string
}

export interface AffectedRecords {
  event: { id: string; type: FailureType; isSimulation: boolean; vendorId: string; vendorName: string; reason: string; createdAt: IsoDate }
  affectedPlans: Array<{
    planId: string
    planName: string
    status: ProcurementStatus
    version: number
    paid: boolean
    suggestedMode: ProposalMode
    affectedQuantity: number
    purchases: Array<{
      purchaseId: string
      vendorName: string
      productName: string
      plannedQuantity: number
      unitPrice: DecimalString
      affectedQuantity: number
      ngos: Array<{ organizationName: string; allocatedQuantity: number }>
      deliveries: Array<{ id: string; trackingRef: string | null; status: string; quantity: number; deliveredQuantity: number }>
    }>
  }>
  totalAffectedQuantity: number
}

export type ProposalMode = 'REPLACEMENT' | 'AMENDMENT'
export type ProposalStatus =
  | 'DRAFT'
  | 'VALIDATED'
  | 'VALIDATED_WITH_WARNINGS'
  | 'REQUIRES_HUMAN_REVIEW'
  | 'REJECTED_INFEASIBLE'
  | 'REJECTED_STALE_DATA'
  | 'REJECTED_VERSION_CONFLICT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPERSEDED'
export type ValidationOutcome =
  | 'VALIDATED'
  | 'VALIDATED_WITH_WARNINGS'
  | 'REJECTED_INFEASIBLE'
  | 'REJECTED_STALE_DATA'
  | 'REJECTED_VERSION_CONFLICT'
  | 'REQUIRES_HUMAN_REVIEW'

export interface ComparisonLine {
  productName: string
  vendorName: string
  offerId: string
  quantity: number
  unitPrice: DecimalString
  lineTotal: DecimalString
  deliveryDays: number
}

export interface PlanComparison {
  mode: ProposalMode
  scope: string
  originalCost: DecimalString
  revisedCost: DecimalString
  costDelta: DecimalString
  originalQuantity: number
  revisedQuantity: number
  demandQuantity: number
  revisedCoverage: number
  unmetQuantity: number
  originalSuppliers: string[]
  revisedSuppliers: string[]
  suppliersAdded: string[]
  suppliersRemoved: string[]
  originalMaxDeliveryDays: number | null
  revisedMaxDeliveryDays: number | null
  budget: DecimalString
  remainingBudgetAfter: DecimalString
  originalLines: ComparisonLine[]
  revisedLines: ComparisonLine[]
}

export interface ValidationCheck {
  code: string
  status: 'PASS' | 'WARN' | 'FAIL'
  category?: 'VERSION' | 'INFEASIBLE' | 'STALE' | 'INFO'
  message: string
  expected?: string
  actual?: string
}

export interface ValidationReport {
  id: string
  proposalId: string
  workflowId: string | null
  outcome: ValidationOutcome
  agentOutcome: ValidationOutcome | null
  validator: string
  checks: { server: ValidationCheck[]; agent: ValidationCheck[] }
  inputFingerprint: string
  createdAt: IsoDate
}

export interface ReplanningProposal {
  id: string
  workflowId: string | null
  mode: ProposalMode
  status: ProposalStatus
  sourcePlanId: string
  sourcePlanVersion: number
  failureEventId: string | null
  isSimulation: boolean
  budget: DecimalString
  maxDeliveryDays: number | null
  scenario: { demand: Array<{ requestId: string; quantity: number }>; excludeOfferIds?: string[]; offerOverrides?: Record<string, unknown> }
  candidate: Omit<OptimizationResult, 'isPreview'>
  comparison: PlanComparison
  inputFingerprint: string
  rationale: string | null
  createdBy: string
  decidedBy: string | null
  decisionComment: string | null
  decidedAt: IsoDate | null
  committedPlanId: string | null
  createdAt: IsoDate
  sourcePlan?: { id: string; name: string; status: ProcurementStatus; version: number; totalCost: DecimalString; emergencyId: string }
  failureEvent?: { id: string; type: FailureType; isSimulation: boolean; reason: string; vendor: { name: string } } | null
  validations: ValidationReport[]
  committedPlan?: { id: string; name: string; status: ProcurementStatus } | null
}

export interface GenerateProposalInput {
  sourcePlanId: string
  failureEventId?: string
  budget?: number
  maxDeliveryDays?: number
  rationale?: string
  createdBy: string
}

export interface ValidationResult {
  report: ValidationReport
  outcome: ValidationOutcome
  serverOutcome: ValidationOutcome
}

export interface ProposalDecisionResult {
  proposal: ReplanningProposal
  committedPlan: { id: string; name: string; status: ProcurementStatus } | null
}

/* ---------- Agent workflows (Python agent service, persisted by Express) ---------- */

export type WorkflowStatus = 'RUNNING' | 'WAITING_FOR_HUMAN' | 'COMPLETED' | 'FAILED'
export type StepKind = 'AI_REASONING' | 'MCP_TOOL' | 'DETERMINISTIC' | 'PERSISTED_MUTATION' | 'SIMULATION' | 'HUMAN_ACTION'

export interface AgentStep {
  id: string
  workflowId: string
  sequence: number
  agent: string
  kind: StepKind
  tool: string | null
  status: string
  inputSummary: unknown
  outputSummary: unknown
  error: string | null
  attempt: number | null
  correlationId: string | null
  startedAt: IsoDate
  durationMs: number
}

export interface AgentWorkflow {
  id: string
  type: 'PROCUREMENT' | 'REPLANNING' | string
  status: WorkflowStatus
  trigger: string
  emergencyId: string | null
  planId: string | null
  proposalId: string | null
  failureEventId: string | null
  isSimulation: boolean
  state: WorkflowState
  checkpoint: string | null
  error: string | null
  createdAt: IsoDate
  updatedAt: IsoDate
  steps?: AgentStep[]
  _count?: { steps: number }
}

/** What the Python service persists as `state` and returns from /workflows/*. */
export interface WorkflowState {
  workflow_id?: string | null
  type: 'PROCUREMENT' | 'REPLANNING'
  status: WorkflowStatus
  checkpoint: string
  is_simulation: boolean
  request: Record<string, unknown>
  results: Record<string, unknown>
  attempts: Array<{
    attempt: number
    proposalId: string
    mode: ProposalMode
    feasible: boolean
    revisedCost: DecimalString
    agentOutcome: ValidationOutcome
    serverOutcome: ValidationOutcome
    outcome: ValidationOutcome
    reportId: string
  }>
  plan_id: string | null
  proposal_id: string | null
  next_action: string | null
  explanation: { available: boolean; text: string | null; reason?: string } | null
  error: { code: string; message: string; tool?: string } | null
}

export interface AgentServiceHealth {
  status: 'ok'
  service: string
  backend: { url: string; reachable: boolean; error?: string }
  mcpTools: number
  llm: boolean
}

export interface AiStatus {
  available: boolean
  provider: string
  model?: string
  reason?: string
}

export interface McpInfo {
  endpoint: string
  transport: string
  auth: string
  tools: Record<string, { scope: 'read' | 'write'; domain: string; title: string }>
}

/* ---------- Analytics ---------- */

export interface SupplierRisk {
  vendorId: string
  vendorName: string
  location: string
  latitude: number | null
  longitude: number | null
  reliability: number
  reliabilityRated: boolean
  offers: number
  usableOffers: number
  totalCapacity: number
  products: string[]
  purchasedQuantity: number
  realFailures: number
  recentRealFailures: number
  simulatedFailures: number
  deliveries: number
  deliveredOnTime: number
  receivedDeliveries: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface ProcurementAnalytics {
  plansByStatus: Record<string, number>
  committedSpendINR: DecimalString
  committedBudgetINR: DecimalString
  capturedPayments: number
  requestsByStatus: Record<string, number>
  requestedUnits: number
  deliveriesByStatus: Record<string, number>
  unitsShipped: number
  unitsDispatched: number
  unitsDelivered: number
  proposalsByStatus: Record<string, number>
  generatedAt: IsoDate
}
