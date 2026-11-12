import { useQuery } from '@tanstack/react-query'

import {
  agentServiceApi,
  analyticsApi,
  approvalApi,
  auditApi,
  authApi,
  deliveryApi,
  emergencyApi,
  failureApi,
  healthApi,
  organizationApi,
  procurementApi,
  productApi,
  reliefRequestApi,
  replanningApi,
  vendorApi,
  workflowApi,
  type ReliefRequestFilters,
} from '../services/endpoints'

export const queryKeys = {
  health: ['health'] as const,
  emergencies: ['emergencies'] as const,
  organizations: ['organizations'] as const,
  products: ['products'] as const,
  reliefRequests: (filters?: ReliefRequestFilters) =>
    filters ? (['relief-requests', filters] as const) : (['relief-requests'] as const),
  vendors: ['vendors'] as const,
  vendorOffers: ['vendor-offers'] as const,
  plans: ['procurement-plans'] as const,
  pendingApprovals: ['approvals', 'pending'] as const,
  deliveries: ['deliveries'] as const,
  delivery: (id: string) => ['deliveries', id] as const,
  auditLogs: ['audit-logs'] as const,
  authStatus: ['auth', 'status'] as const,
  failures: ['supplier-failures'] as const,
  proposals: ['proposals'] as const,
  proposal: (id: string) => ['proposals', id] as const,
  workflows: ['workflows'] as const,
  workflow: (id: string) => ['workflows', id] as const,
  supplierRisk: ['analytics', 'suppliers'] as const,
  procurementAnalytics: ['analytics', 'procurement'] as const,
  agentService: ['agent-service', 'health'] as const,
  mcpInfo: ['agent-service', 'mcp'] as const,
}

/** Everything a write can change; invalidated after mutations so every page stays consistent. */
export const LIVE_KEYS = [
  ['procurement-plans'], ['approvals'], ['deliveries'], ['audit-logs'], ['supplier-failures'], ['proposals'],
  ['workflows'], ['analytics'], ['vendor-offers'], ['relief-requests'], ['emergencies'],
] as const

const LIVE_INTERVAL = 30_000

export const useHealth = () =>
  useQuery({ queryKey: queryKeys.health, queryFn: healthApi.get, refetchInterval: 15_000, retry: 0 })

export const useEmergencies = () =>
  useQuery({ queryKey: queryKeys.emergencies, queryFn: emergencyApi.list, refetchInterval: LIVE_INTERVAL })

export const useOrganizations = () => useQuery({ queryKey: queryKeys.organizations, queryFn: organizationApi.list })

export const useProducts = () => useQuery({ queryKey: queryKeys.products, queryFn: productApi.list })

export const useReliefRequests = (filters?: ReliefRequestFilters) =>
  useQuery({ queryKey: queryKeys.reliefRequests(filters), queryFn: () => reliefRequestApi.list(filters), refetchInterval: LIVE_INTERVAL })

export const useVendors = () => useQuery({ queryKey: queryKeys.vendors, queryFn: vendorApi.list })

export const useVendorOffers = () => useQuery({ queryKey: queryKeys.vendorOffers, queryFn: () => vendorApi.offers() })

export const useProcurementPlans = () =>
  useQuery({ queryKey: queryKeys.plans, queryFn: procurementApi.listPlans, refetchInterval: LIVE_INTERVAL })

export const usePendingApprovals = () =>
  useQuery({ queryKey: queryKeys.pendingApprovals, queryFn: approvalApi.listPending, refetchInterval: LIVE_INTERVAL })

export const useDeliveries = () =>
  useQuery({ queryKey: queryKeys.deliveries, queryFn: () => deliveryApi.list(), refetchInterval: LIVE_INTERVAL })

export const useDelivery = (id: string | null) =>
  useQuery({ queryKey: queryKeys.delivery(id ?? ''), queryFn: () => deliveryApi.get(id!), enabled: Boolean(id) })

export const useAuditLogs = () =>
  useQuery({ queryKey: queryKeys.auditLogs, queryFn: () => auditApi.list({ limit: 500 }), refetchInterval: LIVE_INTERVAL })

export const useAuthStatus = () => useQuery({ queryKey: queryKeys.authStatus, queryFn: authApi.status, staleTime: 5 * 60_000 })

export const useSupplierFailures = () =>
  useQuery({ queryKey: queryKeys.failures, queryFn: () => failureApi.list(), refetchInterval: LIVE_INTERVAL })

export const useProposals = () =>
  useQuery({ queryKey: queryKeys.proposals, queryFn: () => replanningApi.list(), refetchInterval: LIVE_INTERVAL })

export const useWorkflows = () =>
  useQuery({ queryKey: queryKeys.workflows, queryFn: () => workflowApi.list({ limit: 100 }), refetchInterval: LIVE_INTERVAL })

export const useWorkflow = (id: string | null) =>
  useQuery({ queryKey: queryKeys.workflow(id ?? ''), queryFn: () => workflowApi.get(id!), enabled: Boolean(id) })

export const useSupplierRisk = () =>
  useQuery({ queryKey: queryKeys.supplierRisk, queryFn: analyticsApi.suppliers, refetchInterval: LIVE_INTERVAL })

export const useProcurementAnalytics = () =>
  useQuery({ queryKey: queryKeys.procurementAnalytics, queryFn: analyticsApi.procurement, refetchInterval: LIVE_INTERVAL })

/** The Python agent service is optional for every human workflow; failures here never block the UI. */
export const useAgentService = () =>
  useQuery({ queryKey: queryKeys.agentService, queryFn: agentServiceApi.health, refetchInterval: 30_000, retry: 0 })

export const useMcpInfo = () => useQuery({ queryKey: queryKeys.mcpInfo, queryFn: agentServiceApi.mcpInfo, retry: 0, staleTime: 60_000 })
