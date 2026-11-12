// Single place where every verified backend route is called.
import { agentService, api, unwrap } from './api'
import type {
  ApiEnvelope,
  ApprovalDecisionResult,
  AuditLog,
  CaptureResult,
  CheckoutResult,
  Delivery,
  DeliveryDetail,
  DeliveryStatus,
  DeliveryUpdateResult,
  DemandAgentResult,
  Emergency,
  FulfilmentAgentResult,
  HealthResponse,
  OptimizationInput,
  OptimizationResult,
  Organization,
  PaymentWithPlan,
  PendingApproval,
  ProcurementPlan,
  Product,
  ReceiptResult,
  ReliefRequest,
  RequestStatus,
  SupplierAgentResult,
  Vendor,
  VendorOfferWithRelations,
  VerifyOrderResult,
} from '../types/api'
import type {
  AffectedRecords,
  AgentServiceHealth,
  AgentWorkflow,
  AiStatus,
  GenerateProposalInput,
  McpInfo,
  ProcurementAnalytics,
  ProposalDecisionResult,
  ReplanningProposal,
  ReportFailureInput,
  SupplierFailure,
  SupplierRisk,
  ValidationResult,
  WorkflowState,
} from '../types/platform'

export const healthApi = {
  // 503 is a valid answer (API up, DB down), so accept it instead of throwing.
  get: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/health', {
      validateStatus: (status) => status === 200 || status === 503,
      timeout: 8000,
    })
    return response.data
  },
}

export const emergencyApi = {
  list: () => unwrap(api.get<ApiEnvelope<Emergency[]>>('/emergencies')),
  get: (id: string) => unwrap(api.get<ApiEnvelope<Emergency>>(`/emergencies/${id}`)),
}

export const organizationApi = {
  list: () => unwrap(api.get<ApiEnvelope<Organization[]>>('/organizations')),
}

export const productApi = {
  list: () => unwrap(api.get<ApiEnvelope<Product[]>>('/products')),
}

export interface ReliefRequestFilters {
  emergencyId?: string
  organizationId?: string
  status?: RequestStatus
}

export const reliefRequestApi = {
  list: (filters?: ReliefRequestFilters) =>
    unwrap(api.get<ApiEnvelope<ReliefRequest[]>>('/relief-requests', { params: filters })),
}

export const vendorApi = {
  list: () => unwrap(api.get<ApiEnvelope<Vendor[]>>('/vendors')),
  offers: (params?: { vendorId?: string; productId?: string }) =>
    unwrap(api.get<ApiEnvelope<VendorOfferWithRelations[]>>('/vendor-offers', { params })),
}

export const procurementApi = {
  optimize: (input: OptimizationInput) =>
    unwrap(api.post<ApiEnvelope<OptimizationResult>>('/procurement/optimize', input)),
  createPlan: (input: OptimizationInput) =>
    unwrap(api.post<ApiEnvelope<ProcurementPlan>>('/procurement/plans', input)),
  listPlans: () => unwrap(api.get<ApiEnvelope<ProcurementPlan[]>>('/procurement/plans')),
  getPlan: (id: string) =>
    unwrap(api.get<ApiEnvelope<ProcurementPlan>>(`/procurement/plans/${id}`)),
  submitPlan: (id: string) =>
    unwrap(api.post<ApiEnvelope<ProcurementPlan>>(`/procurement/plans/${id}/submit`)),
}

export const approvalApi = {
  listPending: () => unwrap(api.get<ApiEnvelope<PendingApproval[]>>('/approvals')),
  approve: (approvalId: string, body: { approvedBy: string; comments?: string }) =>
    unwrap(
      api.post<ApiEnvelope<ApprovalDecisionResult>>(`/approvals/${approvalId}/approve`, body),
    ),
  reject: (approvalId: string, body: { approvedBy: string; comments: string }) =>
    unwrap(
      api.post<ApiEnvelope<ApprovalDecisionResult>>(`/approvals/${approvalId}/reject`, body),
    ),
}

export const agentApi = {
  demand: (emergencyId: string) =>
    unwrap(api.post<ApiEnvelope<DemandAgentResult>>('/agents/demand', { emergencyId })),
  suppliers: (emergencyId: string) =>
    unwrap(api.post<ApiEnvelope<SupplierAgentResult>>('/agents/suppliers', { emergencyId })),
  fulfilment: (emergencyId: string) =>
    unwrap(api.post<ApiEnvelope<FulfilmentAgentResult>>('/agents/fulfilment', { emergencyId })),
}

export const paymentApi = {
  checkout: (planId: string) =>
    unwrap(api.post<ApiEnvelope<CheckoutResult>>(`/payments/plans/${planId}/checkout`)),
  get: (paymentId: string) =>
    unwrap(api.get<ApiEnvelope<PaymentWithPlan>>(`/payments/${paymentId}`)),
  verify: (paymentId: string) =>
    unwrap(api.get<ApiEnvelope<VerifyOrderResult>>(`/payments/${paymentId}/verify-paypal-order`)),
  capture: (paymentId: string) =>
    unwrap(api.post<ApiEnvelope<CaptureResult>>(`/payments/${paymentId}/capture`)),
}

export const deliveryApi = {
  list: (params?: { planId?: string; status?: DeliveryStatus }) =>
    unwrap(api.get<ApiEnvelope<Delivery[]>>('/deliveries', { params })),
  get: (id: string) => unwrap(api.get<ApiEnvelope<DeliveryDetail>>(`/deliveries/${id}`)),
  generate: (paymentId: string) =>
    unwrap(api.post<ApiEnvelope<{ created: boolean; count: number }>>(`/deliveries/payments/${paymentId}/generate`)),
  /** DISPATCHED / IN_TRANSIT / DELAYED / FAILED. DELIVERED only via receipt(). */
  updateStatus: (id: string, body: { status: Exclude<DeliveryStatus, 'DELIVERED' | 'PENDING'>; reason?: string; dispatchedQuantity?: number; updatedBy: string }) =>
    unwrap(api.patch<ApiEnvelope<DeliveryUpdateResult>>(`/deliveries/${id}/status`, body)),
  receipt: (id: string, body: { receivedBy: string; deliveredQuantity: number; notes?: string; confirmedBy: string }) =>
    unwrap(
      api.post<ApiEnvelope<ReceiptResult>>(`/deliveries/${id}/receipt`, body, {
        headers: { 'Idempotency-Key': `receipt-${id}-${body.deliveredQuantity}-${body.receivedBy}` },
      }),
    ),
}

export const auditApi = {
  list: (params?: { entityType?: string; entityId?: string; action?: string; limit?: number }) =>
    unwrap(api.get<ApiEnvelope<AuditLog[]>>('/audit-logs', { params })),
}

export const authApi = {
  status: () => unwrap(api.get<ApiEnvelope<{ coordinatorAuthRequired: boolean; agentAuthRequired: boolean }>>('/auth/status')),
  verify: (token: string) => unwrap(api.post<ApiEnvelope<{ valid: boolean }>>('/auth/verify', { token })),
}

export const failureApi = {
  list: (params?: { vendorId?: string; planId?: string }) =>
    unwrap(api.get<ApiEnvelope<SupplierFailure[]>>('/supplier-failures', { params })),
  report: (body: ReportFailureInput) =>
    unwrap(api.post<ApiEnvelope<{ event: SupplierFailure; effects: string[]; replayed: boolean }>>('/supplier-failures', body)),
  affected: (id: string) => unwrap(api.get<ApiEnvelope<AffectedRecords>>(`/supplier-failures/${id}/affected`)),
}

export const replanningApi = {
  list: (params?: { sourcePlanId?: string; status?: string }) =>
    unwrap(api.get<ApiEnvelope<ReplanningProposal[]>>('/replanning/proposals', { params })),
  get: (id: string) => unwrap(api.get<ApiEnvelope<ReplanningProposal>>(`/replanning/proposals/${id}`)),
  generate: (body: GenerateProposalInput) =>
    unwrap(api.post<ApiEnvelope<{ proposal: ReplanningProposal; replayed: boolean }>>('/replanning/proposals', body, { timeout: 60_000 })),
  /** Server-only validation (no agent findings): the authoritative recomputation on fresh data. */
  validate: (id: string, validator: string) =>
    unwrap(api.post<ApiEnvelope<ValidationResult>>(`/replanning/proposals/${id}/validations`, { validator })),
  submit: (id: string, submittedBy: string) =>
    unwrap(api.post<ApiEnvelope<ReplanningProposal>>(`/replanning/proposals/${id}/submit`, { submittedBy })),
  approve: (id: string, body: { decidedBy: string; comment?: string }) =>
    unwrap(api.post<ApiEnvelope<ProposalDecisionResult>>(`/replanning/proposals/${id}/approve`, body, { timeout: 60_000 })),
  reject: (id: string, body: { decidedBy: string; comment: string }) =>
    unwrap(api.post<ApiEnvelope<ProposalDecisionResult>>(`/replanning/proposals/${id}/reject`, body)),
}

export const workflowApi = {
  list: (params?: { emergencyId?: string; type?: string; planId?: string; limit?: number }) =>
    unwrap(api.get<ApiEnvelope<AgentWorkflow[]>>('/agent-workflows', { params })),
  get: (id: string) => unwrap(api.get<ApiEnvelope<AgentWorkflow>>(`/agent-workflows/${id}`)),
}

export const analyticsApi = {
  suppliers: () => unwrap(api.get<ApiEnvelope<SupplierRisk[]>>('/analytics/suppliers')),
  procurement: () => unwrap(api.get<ApiEnvelope<ProcurementAnalytics>>('/analytics/procurement')),
}

/** Python agent service (:8001). Responses are not enveloped. */
export const agentServiceApi = {
  health: async () => (await agentService.get<AgentServiceHealth>('/health', { timeout: 8000 })).data,
  aiStatus: async () => (await agentService.get<AiStatus>('/ai/status', { timeout: 8000 })).data,
  mcpInfo: async () => (await agentService.get<McpInfo>('/mcp/info', { timeout: 8000 })).data,
  runProcurement: async (body: { emergency_id: string; budget: number; max_delivery_days?: number; persist?: boolean; submit_for_approval?: boolean }) =>
    (await agentService.post<WorkflowState>('/workflows/procurement', { ...body, trigger: 'coordinator-ui' })).data,
  runReplanning: async (body: {
    plan_id: string
    failure_event_id?: string
    simulation?: { failure_type: string; vendor_id: string; vendor_offer_id?: string; reason: string; reported_capacity?: number; reported_unit_price?: string }
    budget?: number
    max_delivery_days?: number
    submit_for_approval?: boolean
  }) => (await agentService.post<WorkflowState>('/workflows/replanning', { ...body, trigger: 'coordinator-ui' })).data,
  resume: async (workflowId: string) => (await agentService.post<WorkflowState>(`/workflows/${workflowId}/resume`)).data,
}
