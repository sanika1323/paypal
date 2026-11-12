export const C = {
  cyan: '#22d3ee',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  slate: '#64748b',
  grid: 'rgba(148, 163, 184, 0.12)',
  text: '#94a3b8',
}

/** Stable colour per status/category across every chart. */
export const STATUS_COLOR: Record<string, string> = {
  DRAFT: C.slate, ANALYZING: C.cyan, PENDING_APPROVAL: C.amber, APPROVED: C.green, REJECTED: C.red, ORDERED: C.blue,
  COMPLETED: C.violet, CANCELLED: '#475569',
  PENDING: C.amber, DISPATCHED: C.blue, IN_TRANSIT: C.cyan, DELAYED: '#fb923c', DELIVERED: C.green, FAILED: C.red,
  PROCESSING: C.cyan, REFUNDED: C.violet,
  LOW: C.green, MEDIUM: C.amber, HIGH: C.red,
}

export const SERIES = [C.cyan, C.blue, C.violet, C.green, C.amber, '#f472b6', '#2dd4bf', '#818cf8']

export const tooltipStyle = {
  contentStyle: { background: 'rgba(8, 15, 32, 0.95)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 10, fontSize: 12.5, color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', marginBottom: 4 },
  cursor: { fill: 'rgba(56, 189, 248, 0.06)' },
}
