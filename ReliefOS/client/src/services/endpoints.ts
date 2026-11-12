// Single place where every verified backend route is called.
// See docs/API_UI_MAPPING.md for the source of each shape.
import { api, unwrap } from './api'
import type {
  AllocationAgentResult,
  ApiEnvelope,
  ApprovalDecisionResult,
  CaptureResult,
  CheckoutResult,
  DemandAgentResult,
  Emergency,
  FulfilmentAgentResult,
  HealthResponse,
  OptimizationInput,
  OptimizationResult,
  OrchestratorResult,
  Organization,
  PaymentWithPlan,
  PendingApproval,
  ProcurementPlan,
  Product,
  ReliefRequest,
  RequestStatus,
  SupplierAgentResult,
  Vendor,
  VendorOfferWithRelations,
  VerifyOrderResult,
} from '../types/api'

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
  allocate: (input: OptimizationInput) =>
    unwrap(api.post<ApiEnvelope<AllocationAgentResult>>('/agents/allocate', input)),
  fulfilment: (emergencyId: string) =>
    unwrap(api.post<ApiEnvelope<FulfilmentAgentResult>>('/agents/fulfilment', { emergencyId })),
  // Returns 207 with success:false for PARTIAL runs; data is still the full workflow.
  orchestrate: async (input: OptimizationInput): Promise<OrchestratorResult> => {
    const response = await api.post<ApiEnvelope<OrchestratorResult>>('/agents/orchestrate', input, {
      validateStatus: (status) => status === 200 || status === 207,
      timeout: 60000,
    })
    return response.data.data
  },
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
