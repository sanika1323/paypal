import { useQueryClient } from '@tanstack/react-query'

import { LIVE_KEYS } from './queries'

/** Refresh every live view after a write (plans, approvals, deliveries, audit, proposals, workflows…). */
export function useInvalidateLive() {
  const queryClient = useQueryClient()
  return () => {
    for (const key of LIVE_KEYS) void queryClient.invalidateQueries({ queryKey: [...key] })
  }
}
