import { useQuery } from '@tanstack/react-query'
import type { ColDef } from 'ag-grid-community'
import { AlertTriangle, Boxes, ClipboardList, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmergencySelect } from '../components/domain/EmergencySelect'
import { DataGrid } from '../components/grid/DataGrid'
import { Kpi } from '../components/viz/Kpi'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatNumber, humanize } from '../lib/format'
import { agentApi } from '../services/endpoints'
import type { DemandAgentResult, DemandIssue } from '../types/api'

type ProductRow = DemandAgentResult['products'][number]
type RequestRow = ProductRow['organizations'][number] & { productName: string; unit: string }

export function DemandPage() {
  const [emergencyId, setEmergencyId] = useState('')
  const demand = useQuery({ queryKey: ['demand', emergencyId], queryFn: () => agentApi.demand(emergencyId), enabled: Boolean(emergencyId) })
  const d = demand.data

  const productCols = useMemo<ColDef<ProductRow>[]>(() => [
    { headerName: 'Product', field: 'productName', minWidth: 170 },
    { headerName: 'Category', field: 'category' },
    { headerName: 'Total demand', field: 'totalQuantity', type: 'quantity' },
    { headerName: 'Unit', field: 'unit' },
    { headerName: 'Requests', field: 'requestCount', type: 'quantity' },
    { headerName: 'Max urgency', field: 'maxUrgency', type: 'quantity', sort: 'desc', cellClassRules: { 'tone-red': ({ value }) => Number(value) >= 4 } },
    { headerName: 'Avg urgency (qty-weighted)', field: 'averageUrgency', type: 'quantity' },
  ], [])

  const requestRows = useMemo<RequestRow[]>(
    () => (d?.products ?? []).flatMap((p) => p.organizations.map((o) => ({ ...o, productName: p.productName, unit: p.unit }))),
    [d],
  )
  const flagged = useMemo(() => new Set((d?.issues ?? []).flatMap((i) => i.requestIds)), [d])

  const requestCols = useMemo<ColDef<RequestRow>[]>(() => [
    { headerName: 'NGO', field: 'organizationName', minWidth: 170 },
    { headerName: 'Product', field: 'productName' },
    { headerName: 'Quantity', field: 'requestedQuantity', type: 'quantity' },
    { headerName: 'Unit', field: 'unit' },
    { headerName: 'Urgency', field: 'urgency', type: 'quantity' },
    { headerName: 'Status', field: 'status', cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} /> },
    { headerName: 'Flag', valueGetter: ({ data }) => (data && flagged.has(data.requestId) ? 'Check' : ''), cellRenderer: ({ value }: { value: string }) => (value ? <StatusBadge status="WARN" label="Duplicate / conflict" /> : null) },
    { headerName: 'Notes', field: 'notes', flex: 1, minWidth: 200 },
    { headerName: 'Request id', field: 'requestId', cellClass: 'grid-mono' },
  ], [flagged])

  const issueCols = useMemo<ColDef<DemandIssue>[]>(() => [
    { headerName: 'Type', field: 'type', valueFormatter: ({ value }) => humanize(String(value)), minWidth: 190 },
    { headerName: 'NGO', field: 'organizationName' },
    { headerName: 'Product', field: 'productName' },
    { headerName: 'Quantities', valueGetter: ({ data }) => data?.quantities.join(' / ') },
    { headerName: 'What to check', field: 'message', flex: 1, minWidth: 260 },
  ], [])

  return (
    <div className="page">
      <PageHeader
        eyebrow="Demand Agent"
        title="Demand Intelligence"
        description="Requests grouped by product, ranked by urgency."
      />
      <Panel title="Emergency" icon={ClipboardList}>
        <div className="form-grid form-grid--4"><EmergencySelect value={emergencyId} onChange={setEmergencyId} /></div>
      </Panel>

      {!emergencyId ? (
        <EmptyState title="Pick an emergency"  />
      ) : demand.isLoading ? (
        <LoadingSkeleton rows={3} height={90} />
      ) : demand.isError ? (
        <ErrorState error={demand.error} onRetry={() => void demand.refetch()} />
      ) : d ? (
        <>
          <section className="kpi-row kpi-row--4">
            <Kpi label="Eligible requests" value={formatNumber(d.summary.totalRequests)} icon={ClipboardList} tone="blue" />
            <Kpi label="NGOs" value={formatNumber(d.summary.participatingOrganizations)} icon={Users} tone="cyan" />
            <Kpi label="Collective demand (units)" value={formatNumber(d.summary.totalDemand)} icon={Boxes} tone="purple" sub={`${d.summary.distinctProducts} product(s)`} />
            <Kpi label="Needs review" value={formatNumber(d.summary.duplicateOrConflictingGroups)} icon={AlertTriangle} tone={d.issues.length ? 'amber' : 'green'} sub="Duplicate or conflicting groups" />
          </section>
          {d.issues.length > 0 && (
            <Panel title="Duplicates and conflicts" icon={AlertTriangle} iconTone="amber" subtitle="Flagged, never edited">
              <DataGrid rows={d.issues} columns={issueCols} getRowId={(r) => r.requestIds.join('-')} searchable={false} height={220} />
            </Panel>
          )}
          <Panel title="Demand by product" icon={Boxes} iconTone="purple" subtitle={d.methodology}>
            <DataGrid rows={d.products} columns={productCols} getRowId={(r) => r.productId} searchable={false} height={260} emptyMessage="No eligible requests" />
          </Panel>
          <Panel title="Source requests" icon={Users} >
            <DataGrid rows={requestRows} columns={requestCols} getRowId={(r) => r.requestId} height={360} />
          </Panel>
        </>
      ) : null}
    </div>
  )
}
