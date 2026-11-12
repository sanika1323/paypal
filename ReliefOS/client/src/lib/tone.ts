export type Tone = 'red' | 'blue' | 'cyan' | 'green' | 'purple' | 'amber' | 'neutral'

// Visual tone per backend enum value. Labels always come from the value itself.
const TONE_BY_STATUS: Record<string, Tone> = {
  // procurement
  DRAFT: 'neutral',
  ANALYZING: 'cyan',
  PENDING_APPROVAL: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
  ORDERED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'neutral',
  // requests
  PENDING: 'amber',
  VERIFIED: 'blue',
  CONSOLIDATED: 'purple',
  FULFILLED: 'green',
  // payments
  PROCESSING: 'cyan',
  FAILED: 'red',
  REFUNDED: 'purple',
  // deliveries
  DISPATCHED: 'blue',
  IN_TRANSIT: 'cyan',
  DELIVERED: 'green',
  DELAYED: 'amber',
  // orchestrator
  PARTIAL: 'amber',
  SKIPPED: 'neutral',
}

export function toneForStatus(status: string): Tone {
  return TONE_BY_STATUS[status.toUpperCase()] ?? 'neutral'
}

export function toneForSeverity(severity: string): Tone {
  const value = severity.toLowerCase()
  if (value.includes('critical') || value.includes('high') || value.includes('severe')) return 'red'
  if (value.includes('medium') || value.includes('moderate')) return 'amber'
  if (value.includes('low')) return 'green'
  return 'neutral'
}
