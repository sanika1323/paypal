import { useHealth } from '../../hooks/queries'

export type ConnectionState = 'checking' | 'online' | 'database-down' | 'offline'

export function useConnection() {
  const health = useHealth()

  let state: ConnectionState = 'checking'
  if (health.isError) state = 'offline'
  else if (health.data) state = health.data.database === 'connected' ? 'online' : 'database-down'

  const copy: Record<ConnectionState, { title: string; detail: string }> = {
    checking: { title: 'Checking connection', detail: 'Contacting ReliefOS API…' },
    online: { title: 'System online', detail: 'API and database connected' },
    'database-down': { title: 'Database offline', detail: 'API is running, database unreachable' },
    offline: { title: 'API unreachable', detail: 'Cannot reach the ReliefOS backend' },
  }

  return {
    state,
    ...copy[state],
    checkedAt: health.data?.timestamp ?? null,
    refetch: health.refetch,
    isFetching: health.isFetching,
  }
}
