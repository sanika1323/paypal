import { useMutation } from '@tanstack/react-query'
import { LogOut, UserCheck, UserRound } from 'lucide-react'
import { useState } from 'react'

import { useCoordinator } from '../../hooks/useCoordinator'
import { coordinatorSession } from '../../lib/coordinator'
import { getApiError } from '../../services/api'
import { authApi } from '../../services/endpoints'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'

export function CoordinatorSignIn() {
  const { session, required } = useCoordinator()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [token, setToken] = useState('')

  const verify = useMutation({
    mutationFn: () => authApi.verify(token),
    onSuccess: () => {
      coordinatorSession.set({ name: name.trim(), token })
      setOpen(false)
      setToken('')
    },
  })

  if (session) {
    return (
      <div className="coordinator-chip" title="Signed in as coordinator: human-only actions are enabled">
        <UserCheck size={16} />
        <span>{session.name}</span>
        <button type="button" className="icon-btn" aria-label="Sign out" onClick={() => coordinatorSession.set(null)}>
          <LogOut size={15} />
        </button>
      </div>
    )
  }

  return (
    <>
      <button type="button" className="btn btn--ghost btn--sm coordinator-btn" onClick={() => setOpen(true)}>
        <UserRound size={15} />
        <span>{required ? 'Coordinator sign-in' : 'Set coordinator name'}</span>
      </button>
      <ConfirmationDialog
        open={open}
        title="Coordinator sign-in"
        description="Approvals, PayPal payments and delivery updates are human-only actions. Your name is recorded in the audit trail. Agents never receive this credential."
        confirmLabel="Sign in"
        busy={verify.isPending}
        confirmDisabled={!name.trim() || (required && !token)}
        error={verify.isError ? getApiError(verify.error) : undefined}
        onConfirm={() => verify.mutate()}
        onClose={() => setOpen(false)}
      >
        <label className="field">
          <span>Your name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} autoComplete="name" />
        </label>
        {required && (
          <label className="field">
            <span>Coordinator token (RELIEFOS_COORDINATOR_TOKEN)</span>
            <input type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="current-password" />
          </label>
        )}
      </ConfirmationDialog>
    </>
  )
}
