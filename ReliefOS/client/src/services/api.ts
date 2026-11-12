import axios from 'axios'

import type { ApiEnvelope } from '../types/api'

export const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
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
  EXCHANGE_RATE_UNAVAILABLE: 'The INR→USD exchange rate service is unavailable.',
  INVALID_EXCHANGE_RATE_RESPONSE: 'The exchange rate service returned an invalid response.',
  CONVERTED_AMOUNT_TOO_SMALL: 'The converted USD amount is too small for PayPal.',
}

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { message?: unknown } | undefined
    const message = typeof body?.message === 'string' ? body.message : undefined
    if (message) return ERROR_CODE_TEXT[message] ?? message
    if (!error.response) return 'Unable to reach the ReliefOS API.'
    return `Request failed with status ${error.response.status}.`
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}
