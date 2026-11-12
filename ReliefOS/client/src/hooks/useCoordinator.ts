import { useSyncExternalStore } from 'react'

import { coordinatorSession } from '../lib/coordinator'
import { useAuthStatus } from './queries'

/** Current coordinator session plus whether the server requires one. */
export function useCoordinator() {
  const session = useSyncExternalStore(coordinatorSession.subscribe, coordinatorSession.get, coordinatorSession.get)
  const status = useAuthStatus()
  const required = status.data?.coordinatorAuthRequired ?? true
  return {
    session,
    required,
    /** Human-only actions are allowed: signed in, or the server has auth disabled (dev). */
    canAct: Boolean(session) || status.data?.coordinatorAuthRequired === false,
    /** Name recorded as approver / updater. */
    actorName: session?.name ?? null,
  }
}
