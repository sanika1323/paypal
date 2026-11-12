import { useMemo } from 'react'

import { useEmergencies, useOrganizations, useVendors } from '../../hooks/queries'
import { humanize } from '../../lib/format'
import type { Delivery } from '../../types/api'
import type { MapPoint, MapRoute } from './OperationsMap'

/** Real recorded coordinates only: active emergencies, NGOs, suppliers, and one route per delivery. */
export function useMapData(deliveries: Delivery[]) {
  const emergencies = useEmergencies()
  const organizations = useOrganizations()
  const vendors = useVendors()

  return useMemo(() => {
    const points: MapPoint[] = []
    for (const e of emergencies.data ?? []) {
      if (e.isActive && e.latitude != null && e.longitude != null) points.push({ id: e.id, kind: 'emergency', name: e.name, detail: e.location, lat: e.latitude, lng: e.longitude })
    }
    for (const o of organizations.data ?? []) {
      if (o.type === 'NGO' && o.latitude != null && o.longitude != null) points.push({ id: o.id, kind: 'ngo', name: o.name, detail: o.location ?? undefined, lat: o.latitude, lng: o.longitude })
    }
    for (const v of vendors.data ?? []) {
      if (v.latitude != null && v.longitude != null) points.push({ id: v.id, kind: 'supplier', name: v.name, detail: v.location, lat: v.latitude, lng: v.longitude })
    }
    const orgById = new Map((organizations.data ?? []).map((o) => [o.id, o]))
    const vendorById = new Map((vendors.data ?? []).map((v) => [v.id, v]))
    const routes: MapRoute[] = []
    for (const d of deliveries) {
      const org = d.allocation ? orgById.get(d.allocation.organization.id) : undefined
      const vendor = d.procurementPurchase ? vendorById.get(d.procurementPurchase.vendorOffer.vendorId) : undefined
      if (org?.latitude != null && org.longitude != null && vendor?.latitude != null && vendor.longitude != null) {
        routes.push({ id: d.id, from: [vendor.latitude, vendor.longitude], to: [org.latitude, org.longitude], status: d.status, label: `${d.trackingRef ?? d.id}: ${vendor.name} → ${org.name} · ${humanize(d.status)}` })
      }
    }
    return { points, routes, loading: emergencies.isLoading || organizations.isLoading || vendors.isLoading }
  }, [deliveries, emergencies.data, organizations.data, vendors.data, emergencies.isLoading, organizations.isLoading, vendors.isLoading])
}
