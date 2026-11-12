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
  // replanning / validation
  VALIDATED: 'green',
  VALIDATED_WITH_WARNINGS: 'amber',
  REQUIRES_HUMAN_REVIEW: 'purple',
  REJECTED_INFEASIBLE: 'red',
  REJECTED_STALE_DATA: 'red',
  REJECTED_VERSION_CONFLICT: 'red',
  SUPERSEDED: 'neutral',
  REPLACEMENT: 'blue',
  AMENDMENT: 'purple',
  PASS: 'green',
  WARN: 'amber',
  FAIL: 'red',
  // workflows
  RUNNING: 'cyan',
  WAITING_FOR_HUMAN: 'amber',
  OBSERVED: 'purple',
  SKIPPED: 'neutral',
  // risk
  LOW: 'green',
  MEDIUM: 'amber',
  HIGH: 'red',
}

/** Step kinds in an agent trace: what kind of work happened, so AI text is never mistaken for a fact. */
export const STEP_KIND_TONE: Record<string, Tone> = {
  AI_REASONING: 'purple',
  MCP_TOOL: 'blue',
  DETERMINISTIC: 'cyan',
  PERSISTED_MUTATION: 'green',
  SIMULATION: 'amber',
  HUMAN_ACTION: 'red',
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
