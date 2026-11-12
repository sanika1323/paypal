import type { ColDef } from 'ag-grid-community'
import { AlertTriangle, Users } from 'lucide-react'
import { useMemo } from 'react'

import { DataGrid } from '../components/grid/DataGrid'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { ErrorState } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useEmergencies, useReliefRequests } from '../hooks/queries'
import { formatDateTime } from '../lib/format'
import { toneForSeverity } from '../lib/tone'
import type { Emergency, ReliefRequest } from '../types/api'

export function EmergenciesPage() {
  const emergencies = useEmergencies()
  const cols = useMemo<ColDef<Emergency>[]>(() => [
    { headerName: 'Emergency', field: 'name', minWidth: 200 },
    { headerName: 'Location', field: 'location', minWidth: 160 },
    { headerName: 'Severity', field: 'severity', cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} tone={toneForSeverity(value)} label={value} /> },
    { headerName: 'Status', field: 'isActive', cellRenderer: ({ value }: { value: boolean }) => <StatusBadge status={value ? 'ACTIVE' : 'CLOSED'} tone={value ? 'red' : 'neutral'} pulse={value} /> },
    { headerName: 'Coordinates', valueGetter: ({ data }) => (data && data.latitude != null && data.longitude != null ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}` : 'Not recorded') },
    { headerName: 'NGO requests', valueGetter: ({ data }) => data?._count?.requests ?? 0, type: 'quantity' },
    { headerName: 'Procurement plans', valueGetter: ({ data }) => data?._count?.plans ?? 0, type: 'quantity' },
    { headerName: 'Description', field: 'description', flex: 1, minWidth: 240 },
    { headerName: 'Registered', field: 'createdAt', valueFormatter: ({ value }) => formatDateTime(value as string), sort: 'desc' },
  ], [])

  return (
    <div className="page">
      <PageHeader eyebrow="Field operations" title="Emergencies" description="Every registered emergency." />
      <Panel title="All emergencies" icon={AlertTriangle} iconTone="red">
        {emergencies.isError ? <ErrorState compact error={emergencies.error} onRetry={() => void emergencies.refetch()} /> : (
          <DataGrid rows={emergencies.data} columns={cols} getRowId={(r) => r.id} loading={emergencies.isLoading} height={520} emptyMessage="No emergencies registered" />
        )}
      </Panel>
    </div>
  )
}

export function RequestsPage() {
  const requests = useReliefRequests()
  const cols = useMemo<ColDef<ReliefRequest>[]>(() => [
    { headerName: 'NGO', valueGetter: ({ data }) => data?.organization.name, minWidth: 170 },
    { headerName: 'NGO location', valueGetter: ({ data }) => data?.organization.location ?? '—' },
    { headerName: 'Emergency', valueGetter: ({ data }) => data?.emergency.name },
    { headerName: 'Product', valueGetter: ({ data }) => data?.product.name },
    { headerName: 'Quantity', field: 'quantity', type: 'quantity' },
    { headerName: 'Unit', valueGetter: ({ data }) => data?.product.unit },
    { headerName: 'Urgency', field: 'urgency', type: 'quantity', cellClassRules: { 'tone-red': ({ value }) => Number(value) >= 4 } },
    { headerName: 'Status', field: 'status', cellRenderer: ({ value }: { value: string }) => <StatusBadge status={value} /> },
    { headerName: 'Notes', field: 'notes', flex: 1, minWidth: 220 },
    { headerName: 'Submitted', field: 'createdAt', valueFormatter: ({ value }) => formatDateTime(value as string), sort: 'desc' },
  ], [])

  return (
    <div className="page">
      <PageHeader eyebrow="Community needs" title="NGO Requests" description="Original requests, never modified by agents." />
      <Panel title="All relief requests" icon={Users}>
        {requests.isError ? <ErrorState compact error={requests.error} onRetry={() => void requests.refetch()} /> : (
          <DataGrid rows={requests.data} columns={cols} getRowId={(r) => r.id} loading={requests.isLoading} height={560} emptyMessage="No relief requests yet" />
        )}
      </Panel>
    </div>
  )
}
