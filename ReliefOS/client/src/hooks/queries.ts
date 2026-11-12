import { useQuery } from '@tanstack/react-query'

import {
  approvalApi,
  emergencyApi,
  healthApi,
  organizationApi,
  procurementApi,
  productApi,
  reliefRequestApi,
  vendorApi,
  type ReliefRequestFilters,
} from '../services/endpoints'

export const queryKeys = {
  health: ['health'] as const,
  emergencies: ['emergencies'] as const,
  emergency: (id: string) => ['emergencies', id] as const,
  organizations: ['organizations'] as const,
  products: ['products'] as const,
  reliefRequests: (filters?: ReliefRequestFilters) =>
    filters ? (['relief-requests', filters] as const) : (['relief-requests'] as const),
  vendors: ['vendors'] as const,
  vendorOffers: ['vendor-offers'] as const,
  plans: ['procurement-plans'] as const,
  plan: (id: string) => ['procurement-plans', id] as const,
  pendingApprovals: ['approvals', 'pending'] as const,
  payment: (id: string) => ['payments', id] as const,
}

const LIVE_INTERVAL = 30_000

export const useHealth = () =>
  useQuery({
    queryKey: queryKeys.health,
    queryFn: healthApi.get,
    refetchInterval: 15_000,
    retry: 0,
  })

export const useEmergencies = () =>
  useQuery({ queryKey: queryKeys.emergencies, queryFn: emergencyApi.list, refetchInterval: LIVE_INTERVAL })

export const useOrganizations = () =>
  useQuery({ queryKey: queryKeys.organizations, queryFn: organizationApi.list })

export const useProducts = () =>
  useQuery({ queryKey: queryKeys.products, queryFn: productApi.list })

export const useReliefRequests = (filters?: ReliefRequestFilters) =>
  useQuery({
    queryKey: queryKeys.reliefRequests(filters),
    queryFn: () => reliefRequestApi.list(filters),
    refetchInterval: LIVE_INTERVAL,
  })

export const useVendors = () => useQuery({ queryKey: queryKeys.vendors, queryFn: vendorApi.list })

export const useVendorOffers = () =>
  useQuery({ queryKey: queryKeys.vendorOffers, queryFn: () => vendorApi.offers() })

export const useProcurementPlans = () =>
  useQuery({ queryKey: queryKeys.plans, queryFn: procurementApi.listPlans, refetchInterval: LIVE_INTERVAL })

export const usePendingApprovals = () =>
  useQuery({
    queryKey: queryKeys.pendingApprovals,
    queryFn: approvalApi.listPending,
    refetchInterval: LIVE_INTERVAL,
  })
