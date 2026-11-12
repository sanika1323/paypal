import type { ColDef } from 'ag-grid-community'
import { PackageSearch, ScatterChart as ScatterIcon, ShieldAlert } from 'lucide-react'
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { useMemo } from 'react'

import { DataGrid } from '../components/grid/DataGrid'
import { decimalField } from '../components/grid/config'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { ErrorState } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { C, tooltipStyle } from '../components/viz/palette'
import { useSupplierRisk, useVendorOffers } from '../hooks/queries'
import { formatDateTime } from '../lib/format'
import type { VendorOfferWithRelations } from '../types/api'
import type { SupplierRisk } from '../types/platform'

const offerState = (o: VendorOfferWithRelations): string => {
  if (!o.isAvailable) return 'UNAVAILABLE'
  if (o.validUntil && new Date(o.validUntil).getTime() < Date.now()) return 'EXPIRED'
  if (o.capacity <= 0) return 'NO_CAPACITY'
  return 'USABLE'
}

export function SuppliersPage() {
  const risk = useSupplierRisk()
  const offers = useVendorOffers()

  const riskCols = useMemo<ColDef<SupplierRisk>[]>(() => [
    { headerName: 'Supplier', field: 'vendorName', minWidth: 180 },
    { headerName: 'Location', field: 'location' },
    { headerName: 'Risk', field: 'riskLevel', cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} /> },
    { headerName: 'Risk score', field: 'riskScore', filter: 'agNumberColumnFilter', sort: 'desc' },
    { headerName: 'Reliability', valueGetter: ({ data }) => (data?.reliabilityRated ? Math.round(data.reliability * 100) : null), valueFormatter: ({ value }) => (value == null ? 'Unrated' : `${value}%`) },
    { headerName: 'Real failures', field: 'realFailures', type: 'quantity' },
    { headerName: 'Last 90 days', field: 'recentRealFailures', type: 'quantity' },
    { headerName: 'Simulated', field: 'simulatedFailures', type: 'quantity' },
    { headerName: 'Usable offers', valueGetter: ({ data }) => (data ? `${data.usableOffers} / ${data.offers}` : '') },
    { headerName: 'Capacity', field: 'totalCapacity', type: 'quantity' },
    { headerName: 'Purchased', field: 'purchasedQuantity', type: 'quantity' },
    { headerName: 'Received on time', valueGetter: ({ data }) => (data && data.receivedDeliveries ? `${data.deliveredOnTime} / ${data.receivedDeliveries}` : '—') },
    { headerName: 'Products', valueGetter: ({ data }) => data?.products.join(', '), flex: 1, minWidth: 200 },
  ], [])

  const offerCols = useMemo<ColDef<VendorOfferWithRelations>[]>(() => [
    { headerName: 'Supplier', valueGetter: ({ data }) => data?.vendor.name, minWidth: 180 },
    { headerName: 'Product', valueGetter: ({ data }) => data?.product.name },
    { headerName: 'State', valueGetter: ({ data }) => (data ? offerState(data) : ''), cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} tone={value === 'USABLE' ? 'green' : 'red'} /> },
    { headerName: 'Unit price', valueGetter: decimalField<VendorOfferWithRelations>((r) => r.unitPrice), type: 'inr', sort: 'asc' },
    { headerName: 'Capacity', field: 'capacity', type: 'quantity' },
    { headerName: 'Unit', valueGetter: ({ data }) => data?.product.unit },
    { headerName: 'Delivery (days)', field: 'deliveryDays', type: 'quantity' },
    { headerName: 'Valid until', field: 'validUntil', valueFormatter: ({ value }) => (value ? formatDateTime(value as string) : 'Open-ended') },
    { headerName: 'Offer id', field: 'id', cellClass: 'grid-mono' },
  ], [])

  return (
    <div className="page">
      <PageHeader
        eyebrow="Supplier Agent"
        title="Suppliers"
        description="Stored offers and documented risk."
      />
      <Panel title="Price × speed × capacity" icon={ScatterIcon} iconTone="cyan" subtitle="Usable offers · bubble size = capacity">
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
            <CartesianGrid stroke={C.grid} />
            <XAxis type="number" dataKey="price" name="Unit price" unit=" ₹" stroke={C.text} fontSize={11} tickLine={false} />
            <YAxis type="number" dataKey="days" name="Delivery" unit="d" stroke={C.text} fontSize={11} tickLine={false} width={40} />
            <ZAxis type="number" dataKey="capacity" range={[80, 900]} name="Capacity" />
            <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: '3 3' }} formatter={(v, n) => [v, n]} labelFormatter={() => ''} />
            <Scatter data={(offers.data ?? []).filter((o) => offerState(o) === 'USABLE').map((o) => ({ price: Number(o.unitPrice), days: o.deliveryDays, capacity: o.capacity, name: o.vendor.name }))} fill={C.cyan} fillOpacity={0.55} stroke={C.cyan} />
          </ScatterChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Supplier risk" icon={ShieldAlert} iconTone="amber" subtitle="0.6 × (1 − reliability) + 0.4 × recent real failures">
        {risk.isError ? <ErrorState compact error={risk.error} onRetry={() => void risk.refetch()} /> : (
          <DataGrid rows={risk.data} columns={riskCols} getRowId={(r) => r.vendorId} loading={risk.isLoading} height={320} emptyMessage="No suppliers registered" />
        )}
      </Panel>
      <Panel title="Offers" icon={PackageSearch} iconTone="green" >
        {offers.isError ? <ErrorState compact error={offers.error} onRetry={() => void offers.refetch()} /> : (
          <DataGrid rows={offers.data} columns={offerCols} getRowId={(r) => r.id} loading={offers.isLoading} height={360} emptyMessage="No offers" />
        )}
      </Panel>
    </div>
  )
}
