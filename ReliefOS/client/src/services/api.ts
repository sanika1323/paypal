import axios from 'axios'

import { coordinatorSession } from '../lib/coordinator'
import type { ApiEnvelope } from '../types/api'

export const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const session = coordinatorSession.get()
  if (session?.token) config.headers.set('Authorization', `Bearer ${session.token}`)
  return config
})

/** Python agent service (agents + MCP server, :8001), proxied by Vite at /agent-service. */
export const agentService = axios.create({
  baseURL: '/agent-service',
  timeout: 180_000,
  headers: { 'Content-Type': 'application/json' },
})

// Starting a workflow needs the same coordinator token the API requires.
agentService.interceptors.request.use((config) => {
  const session = coordinatorSession.get()
  if (session?.token) config.headers.set('Authorization', `Bearer ${session.token}`)
  return config
})

/** Unwraps the `{ success, data }` envelope used by every ReliefOS route. */
export async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await request
  return response.data.data
}

// Human-readable text for the machine codes the payment controller returns verbatim.
const ERROR_CODE_TEXT: Record<string, string> = {
  PLAN_NOT_FOUND: 'Procurement plan not found.',
  PAYMENT_NOT_FOUND: 'Payment record not found.',
  PLAN_NOT_APPROVED: 'The plan must be approved by a human reviewer before checkout.',
  INVALID_PROCUREMENT_AMOUNT: 'The plan has no valid procurement amount.',
  PAYMENT_ALREADY_EXISTS: 'An active payment already exists for this plan.',
  PAYMENT_NOT_READY_FOR_CAPTURE: 'This payment is not ready to be captured.',
  PAYMENT_CAPTURE_ALREADY_IN_PROGRESS: 'A capture for this payment is already in progress.',
  PAYPAL_ORDER_ID_MISSING: 'No PayPal order is linked to this payment.',
  PAYPAL_ORDER_VALIDATION_FAILED: 'The PayPal order does not match the recorded payment.',
  PAYPAL_ORDER_VERIFICATION_FAILED: 'PayPal could not verify the order.',
  PAYPAL_CAPTURE_FAILED_RECONCILIATION_REQUIRED:
    'PayPal capture outcome is uncertain. The payment needs reconciliation.',
  PAYPAL_CAPTURE_VALIDATION_FAILED: 'PayPal returned a capture that failed validation.',
  PAYPAL_CREDENTIALS_MISSING: 'PayPal Sandbox credentials are not configured on the server.',
  PAYPAL_AUTHENTICATION_FAILED: 'The server could not authenticate with PayPal Sandbox.',
  PAYPAL_RETURN_URLS_MISSING: 'PayPal return URLs are not configured on the server.',
  COORDINATOR_AUTH_REQUIRED: 'Sign in as a coordinator to do this.',
  'Coordinator sign-in required for this action': 'Sign in as a coordinator to do this.',
  INVALID_DELIVERY_TRANSITION: 'That status change is not allowed for this delivery.',
  FAILURE_REASON_REQUIRED: 'A failure reason is required.',
  REASON_REQUIRED: 'A reason is required for delayed or failed deliveries.',
  DELIVERY_NOT_IN_TRANSIT: 'Receipt can only be confirmed after the delivery is dispatched.',
  FORBIDDEN_FOR_AGENTS: 'Agents are not allowed to do this; a human coordinator must.',
  PLAN_VERSION_CONFLICT: 'The plan changed since this proposal was made. Re-validate or regenerate it.',
  PROPOSAL_NO_LONGER_VALID: 'Re-validation on fresh data failed, so the proposal was not committed.',
  PROPOSAL_NOT_VALIDATED: 'Only a validated proposal can be submitted for approval.',
  SIMULATION_CANNOT_BE_SUBMITTED: 'Simulations are for comparison only and cannot be submitted.',
  NO_EVIDENCED_SHORTFALL: 'A paid plan can only be amended for failed or short-delivered quantity.',
  PAYMENT_IN_PROGRESS: 'A payment for this plan is in progress; wait for it to settle.',
  PLAN_NOT_REPLANNABLE: 'This plan cannot be replanned in its current state.',
  AGENTS_MAY_ONLY_SIMULATE: 'Agents may only record simulated failures.',
  IDEMPOTENCY_KEY_REUSED: 'This request key was already used with different data.',
  PAYMENT_NOT_COMPLETED: 'The payment has not been captured yet.',
  EXCHANGE_RATE_UNAVAILABLE: 'The INR→USD exchange rate service is unavailable.',
  INVALID_EXCHANGE_RATE_RESPONSE: 'The exchange rate service returned an invalid response.',
  CONVERTED_AMOUNT_TOO_SMALL: 'The converted USD amount is too small for PayPal.',
}

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { message?: unknown; code?: unknown; detail?: unknown } | undefined
    const code = typeof body?.code === 'string' ? body.code : undefined
    if (code && ERROR_CODE_TEXT[code]) return ERROR_CODE_TEXT[code]
    // FastAPI (agent service) errors: { detail: { code, message } } or { detail: [...] }
    const detail = body?.detail as { code?: string; message?: string } | Array<{ msg?: string }> | undefined
    if (Array.isArray(detail)) return detail.map((d) => d.msg).filter(Boolean).join('; ') || 'Invalid request.'
    if (detail && typeof detail === 'object') return (detail.code && ERROR_CODE_TEXT[detail.code]) || detail.message || 'Agent service error.'
    const message = typeof body?.message === 'string' ? body.message : undefined
    if (message) return ERROR_CODE_TEXT[message] ?? message
    if (!error.response && error.config?.baseURL === '/agent-service') return 'The agent service (:8001) is not reachable.'
    if (!error.response) return 'Unable to reach the ReliefOS API.'
    return `Request failed with status ${error.response.status}.`
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}
