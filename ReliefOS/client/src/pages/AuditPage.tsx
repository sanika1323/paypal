import type { ColDef } from 'ag-grid-community'
import { BarChart3, FileClock, RefreshCw } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMemo, useState } from 'react'

import { DataGrid } from '../components/grid/DataGrid'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { ErrorState } from '../components/ui/States'
import { C, SERIES, tooltipStyle } from '../components/viz/palette'
import { useAuditLogs } from '../hooks/queries'
import { formatDateTime, humanize } from '../lib/format'
import type { AuditLog } from '../types/api'

const GROUPS: Array<{ label: string; match: (a: string) => boolean }> = [
  { label: 'All', match: () => true },
  { label: 'Plans & approvals', match: (a) => /PLAN|APPROV|REJECT/.test(a) && !a.startsWith('REPLANNING') },
  { label: 'Payments', match: (a) => /PAYMENT|PAYPAL|WEBHOOK|CAPTURE|CHECKOUT/.test(a) },
  { label: 'Deliveries', match: (a) => a.startsWith('DELIVER') },
  { label: 'Failures & replanning', match: (a) => a.startsWith('SUPPLIER_FAILURE') || a.startsWith('REPLANNING') || a.includes('VALIDATION') },
]

export function AuditPage() {
  const audit = useAuditLogs()
  const [group, setGroup] = useState(0)
  const rows = useMemo(() => (audit.data ?? []).filter((r) => GROUPS[group]!.match(r.action)), [audit.data, group])
  const daily = useMemo(() => {
    const m = new Map<string, Record<string, number | string>>()
    for (const r of [...(audit.data ?? [])].reverse()) {
      const day = new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      const row = m.get(day) ?? { day }
      const g = GROUPS.slice(1).find((x) => x.match(r.action))?.label ?? 'Other'
      row[g] = Number(row[g] ?? 0) + 1
      m.set(day, row)
    }
    return [...m.values()].slice(-14)
  }, [audit.data])

  const cols = useMemo<ColDef<AuditLog>[]>(() => [
    { headerName: 'When', field: 'createdAt', valueFormatter: ({ value }) => formatDateTime(value as string), sort: 'desc', minWidth: 170 },
    { headerName: 'Event', field: 'action', valueFormatter: ({ value }) => humanize(String(value)), minWidth: 240 },
    { headerName: 'Entity', field: 'entityType' },
    { headerName: 'Entity id', field: 'entityId', cellClass: 'grid-mono' },
    { headerName: 'Details', valueGetter: ({ data }) => (data?.details ? JSON.stringify(data.details) : ''), flex: 1, minWidth: 360, cellClass: 'grid-mono' },
  ], [])

  return (
    <div className="page">
      <PageHeader eyebrow="Accountability" title="Audit Trail" description="Append-only, server-written. Latest 500 events." />
      <Panel title="Events per day" icon={BarChart3} iconTone="cyan">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={daily} margin={{ left: 0, right: 8, top: 4 }}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey="day" stroke={C.text} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke={C.text} fontSize={11} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {[...GROUPS.slice(1).map((g) => g.label), 'Other'].map((g, i) => <Bar key={g} dataKey={g} stackId="a" fill={SERIES[i]} radius={i === GROUPS.length - 1 ? [3, 3, 0, 0] : undefined} />)}
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <div className="status-strip" role="group" aria-label="Filter events">
        {GROUPS.map((g, i) => (
          <button key={g.label} type="button" className={`status-chip${group === i ? ' status-chip--active' : ''}`} onClick={() => setGroup(i)}>
            {g.label} <strong>{(audit.data ?? []).filter((r) => g.match(r.action)).length}</strong>
          </button>
        ))}
      </div>
      <Panel title="Events" icon={FileClock}
        actions={<button type="button" className="icon-btn" aria-label="Refresh audit trail" onClick={() => void audit.refetch()}><RefreshCw size={15} className={audit.isFetching ? 'spin' : undefined} /></button>}>
        {audit.isError ? <ErrorState compact error={audit.error} onRetry={() => void audit.refetch()} /> : (
          <DataGrid rows={rows} columns={cols} getRowId={(r) => r.id} loading={audit.isLoading} height={560} pageSize={50} exportName="reliefos-audit" emptyMessage="No audit events" />
        )}
      </Panel>
    </div>
  )
}
