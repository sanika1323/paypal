// Types mirror server/prisma/schema.prisma and the service `include` shapes.
// Prisma Decimal -> string, DateTime -> ISO string.

export type DecimalString = string
export type IsoDate = string

export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  count?: number
  data: T
}

export interface HealthResponse {
  success: boolean
  application: string
  api: string
  database: 'connected' | 'disconnected'
  timestamp: IsoDate
}

export type OrganizationType = 'NGO' | 'GOVERNMENT' | 'SUPPLIER'
export type RequestStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'CONSOLIDATED'
  | 'APPROVED'
  | 'FULFILLED'
  | 'REJECTED'
export type ProcurementStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ORDERED'
  | 'COMPLETED'
  | 'CANCELLED'
export type PaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
export type DeliveryStatus =
  | 'PENDING'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'DELAYED'
  | 'FAILED'

/* ---------- Core records ---------- */

export interface Emergency {
  id: string
  name: string
  description: string | null
  location: string
  severity: string
  isActive: boolean
  createdAt: IsoDate
  _count?: { requests: number; plans: number }
}

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  email: string
  location: string | null
  createdAt: IsoDate
  updatedAt: IsoDate
  _count?: { requests: number; allocations: number }
}

export interface Product {
  id: string
  name: string
  category: string
  unit: string
  createdAt: IsoDate
  _count?: { requests: number; offers: number }
}

export interface Vendor {
  id: string
  name: string
  location: string
  email: string | null
  reliability: number
  createdAt: IsoDate
  _count?: { offers: number }
}

export interface VendorOffer {
  id: string
  vendorId: string
  productId: string
  unitPrice: DecimalString
  capacity: number
  deliveryDays: number
  createdAt: IsoDate
}

export interface VendorOfferWithRelations extends VendorOffer {
  vendor: Vendor
  product: Product
}

export interface ReliefRequest {
  id: string
  organizationId: string
  emergencyId: string
  productId: string
  quantity: number
  urgency: number
  status: RequestStatus
  notes: string | null
  createdAt: IsoDate
  updatedAt: IsoDate
  organization: Organization
  emergency: Emergency
  product: Product
}

/* ---------- Procurement ---------- */

export interface ProcurementPurchase {
  id: string
  planItemId: string
  vendorOfferId: string
  quantity: number
  unitPrice: DecimalString
  totalAmount: DecimalString
  deliveryDays: number
  createdAt: IsoDate
  vendorOffer: VendorOffer & { vendor: Vendor; product?: Product }
}

export interface Allocation {
  id: string
  planId: string
  organizationId: string
  quantity: number
  amount: DecimalString
  reliefRequestId: string | null
  planItemId: string | null
  organization: Organization
  reliefRequest?: Omit<ReliefRequest, 'organization' | 'emergency' | 'product'> | null
}

export interface ProcurementPlanItem {
  id: string
  planId: string
  productId: string
  requestedQuantity: number
  purchasedQuantity: number
  unfulfilledQuantity: number
  unit: string
  createdAt: IsoDate
  product: Product
  purchases: ProcurementPurchase[]
  allocations?: Allocation[]
}

export interface Approval {
  id: string
  planId: string
  approvedBy: string
  approved: boolean
  comments: string | null
  createdAt: IsoDate
}

export interface Payment {
  id: string
  planId: string
  amount: DecimalString
  currency: string
  status: PaymentStatus
  paypalOrderId: string | null
  paypalCaptureId: string | null
  originalAmountINR: DecimalString | null
  exchangeRate: DecimalString | null
  exchangeRateDate: string | null
  exchangeRateProvider: string | null
  createdAt: IsoDate
  updatedAt: IsoDate
}

export interface PaymentWithPlan extends Payment {
  plan: { id: string; name: string; status: ProcurementStatus; emergencyId: string }
}

export interface ProcurementPlan {
  id: string
  emergencyId: string
  name: string
  totalBudget: DecimalString
  totalCost: DecimalString
  status: ProcurementStatus
  explanation: string | null
  createdAt: IsoDate
  updatedAt: IsoDate
  emergency: Emergency
  items: ProcurementPlanItem[]
  approvals: Approval[]
  payments: Payment[]
}

export interface PendingApproval extends Approval {
  plan: Omit<ProcurementPlan, 'approvals' | 'payments'>
}

export interface ApprovalDecisionResult {
  approval: Approval
  planStatus: 'APPROVED' | 'REJECTED'
}

/* ---------- Optimizer / agents (computed, not persisted) ---------- */

export interface OptimizationInput {
  emergencyId: string
  budget: number
  maxDeliveryDays?: number
}

export interface EmergencySummary {
  id: string
  name: string
  location: string
  severity: string
}

export interface OptimizedPurchase {
  offerId: string
  vendorId: string
  vendorName: string
  productId: string
  productName: string
  quantity: number
  unit: string
  unitPrice: DecimalString
  totalAmount: DecimalString
  deliveryDays: number
}

export interface NgoAllocation {
  requestId: string
  organizationId: string
  organizationName: string
  productId: string
  productName: string
  requestedQuantity: number
  allocatedQuantity: number
  unfulfilledQuantity: number
  urgency: number
}

export interface OptimizedProduct {
  productId: string
  productName: string
  unit: string
  requestedQuantity: number
  fulfilledQuantity: number
  unfulfilledQuantity: number
  estimatedCost: DecimalString
  purchases: OptimizedPurchase[]
}

export interface FulfillmentSummary {
  totalDemand: number
  fulfilledQuantity: number
  unfulfilledQuantity: number
  fulfillmentPercentage: number
}

export interface OptimizationResult {
  emergency: EmergencySummary
  budget: DecimalString
  estimatedCost: DecimalString
  remainingBudget: DecimalString
  budgetFeasible: boolean
  fulfillment: FulfillmentSummary
  feasible: boolean
  constraints: {
    maxDeliveryDays: number | null
    budgetFeasible: boolean
    supplierCapacitySufficient: boolean
  }
  products: OptimizedProduct[]
  supplierPurchases: OptimizedPurchase[]
  ngoAllocations: NgoAllocation[]
  optimizationMethod: string
  isPreview: true
}

export interface DemandAgentResult {
  agent: 'DEMAND_AGENT'
  status: 'COMPLETED'
  emergency: EmergencySummary
  summary: {
    totalRequests: number
    participatingOrganizations: number
    distinctProducts: number
    totalDemand: number
  }
  products: Array<{
    productId: string
    productName: string
    category: string
    unit: string
    totalQuantity: number
    requestCount: number
    averageUrgency: number
    organizations: Array<{
      requestId: string
      organizationId: string
      organizationName: string
      requestedQuantity: number
      urgency: number
      status: RequestStatus
      notes: string | null
      createdAt: IsoDate
    }>
  }>
  methodology: string
  generatedAt: IsoDate
}

export interface EvaluatedOffer {
  rank: number
  offerId: string
  vendorId: string
  vendorName: string
  vendorLocation: string
  vendorReliability: number
  productId: string
  unitPrice: DecimalString
  capacity: number
  deliveryDays: number
  fulfillableQuantity: number
  remainingDemand: number
  capacitySufficient: boolean
  estimatedCostForAvailableQuantity: DecimalString
}

export interface SupplierProductAnalysis {
  productId: string
  productName: string
  unit: string
  requiredQuantity: number
  supplierCount: number
  totalAvailableCapacity: number
  aggregateCapacitySufficient: boolean
  cheapestOffer: EvaluatedOffer | null
  fastestOffer: EvaluatedOffer | null
  offers: EvaluatedOffer[]
}

export interface SupplierAgentSummary {
  productsEvaluated: number
  totalOffersEvaluated: number
  productsWithSupplierOffers: number
  productsWithoutSupplierOffers: number
}

export interface SupplierAgentResult {
  agent: 'SUPPLIER_AGENT'
  status: 'COMPLETED'
  emergency: EmergencySummary
  summary: SupplierAgentSummary
  products: SupplierProductAnalysis[]
  methodology: string
  generatedAt: IsoDate
}

export interface AllocationAgentResult {
  agent: 'ALLOCATION_AGENT'
  status: 'COMPLETED'
  decision: 'READY_FOR_PLAN' | 'CONSTRAINTS_UNMET'
  emergency: EmergencySummary
  input: { budget: DecimalString; maxDeliveryDays: number | null }
  supplierAnalysis: { summary: SupplierAgentSummary; products: SupplierProductAnalysis[] }
  allocation: Omit<OptimizationResult, 'emergency' | 'optimizationMethod' | 'isPreview'>
  optimizationMethod: string
  explanation: string
  isPreview: true
  generatedAt: IsoDate
}

export interface FulfilmentDelivery {
  deliveryId: string
  trackingRef: string | null
  destination: string
  quantity: number
  status: DeliveryStatus
  estimatedAt: IsoDate | null
  deliveredAt: IsoDate | null
}

export interface FulfilmentPlan {
  planId: string
  planName: string
  planStatus: ProcurementStatus
  totalBudget: DecimalString
  totalCost: DecimalString
  approvalGranted: boolean
  approvalCount: number
  purchases: Array<{
    purchaseId: string
    productName: string
    quantity: number
    unit: string
    vendor: { id: string; name: string; location: string }
    unitPrice: DecimalString
    totalAmount: DecimalString
    deliveryDays: number
  }>
  payments: Array<{
    paymentId: string
    amount: DecimalString
    currency: string
    status: PaymentStatus
    paypalOrderId: string | null
    paypalCaptureId: string | null
    deliveries: FulfilmentDelivery[]
  }>
  deliverySummary: {
    totalDeliveries: number
    delivered: number
    inTransit: number
    delayed: number
    pending: number
  }
  nextAction:
    | 'PLAN_CANCELLED'
    | 'AWAITING_APPROVAL'
    | 'APPROVAL_REQUIRED'
    | 'AWAITING_PAYMENT'
    | 'AWAITING_DISPATCH'
    | 'DELIVERY_COMPLETED'
    | 'DELIVERY_IN_PROGRESS'
}

export interface FulfilmentAgentResult {
  agent: 'FULFILMENT_AGENT'
  status: 'COMPLETED'
  emergency: EmergencySummary
  summary: {
    totalPlans: number
    totalSupplierPurchases: number
    totalPayments: number
    totalDeliveries: number
    delivered: number
    inTransit: number
    delayed: number
  }
  plans: FulfilmentPlan[]
  methodology: string
  generatedAt: IsoDate
}

export type AgentName =
  | 'DEMAND_AGENT'
  | 'SUPPLIER_AGENT'
  | 'ALLOCATION_AGENT'
  | 'FULFILMENT_AGENT'

export interface OrchestratorStage {
  agent: AgentName
  status: 'COMPLETED' | 'FAILED' | 'SKIPPED'
  startedAt: IsoDate
  completedAt: IsoDate
  durationMs: number
  error?: string
  summary?: unknown
}

export interface OrchestratorResult {
  workflow: 'RELIEFOS_PROCUREMENT_ORCHESTRATOR'
  status: 'COMPLETED' | 'PARTIAL'
  emergencyId: string
  input: { budget: DecimalString; maxDeliveryDays: number | null }
  execution: {
    startedAt: IsoDate
    completedAt: IsoDate
    durationMs: number
    totalStages: number
    completedStages: number
    failedStages: number
    skippedStages: number
  }
  stages: OrchestratorStage[]
  results: {
    demand: DemandAgentResult | null
    suppliers: SupplierAgentResult | null
    allocationPreview: AllocationAgentResult | null
    existingFulfilmentState: FulfilmentAgentResult | null
  }
  importantNotes: string[]
  audit: { persisted: boolean; error: string | null }
}

/* ---------- Payments ---------- */

export interface CheckoutResult {
  paymentId: string
  orderId: string
  approvalUrl: string
  originalAmountINR: DecimalString
  amountUSD: DecimalString
  exchangeRate: number
  exchangeRateDate: string
  exchangeRateProvider: string
  currency: 'USD'
}

export interface VerifyOrderResult {
  paymentId: string
  orderId: string
  localPaymentStatus: PaymentStatus
  paypalOrderStatus: string
  amountUSD: DecimalString
  currency: string
  originalAmountINR: DecimalString | null
  exchangeRate: DecimalString | null
  exchangeRateDate: string | null
  exchangeRateProvider: string | null
  approvalUrl: string | null
  captured: boolean
}

export interface CaptureResult {
  paymentId: string
  status: PaymentStatus
  captureId: string | null
  amount?: DecimalString
  currency?: string
  alreadyCompleted: boolean
}
