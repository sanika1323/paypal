// Coordinator credential for human-only actions. Kept in sessionStorage (per tab) and
// sent as a Bearer token. Agents never receive it.
const KEY = 'reliefos.coordinator'

export interface CoordinatorSession {
  name: string
  token: string
}

type Listener = (session: CoordinatorSession | null) => void
const listeners = new Set<Listener>()

function read(): CoordinatorSession | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CoordinatorSession>
    return typeof parsed.name === 'string' && typeof parsed.token === 'string' ? { name: parsed.name, token: parsed.token } : null
  } catch {
    return null
  }
}

let current: CoordinatorSession | null = read()

export const coordinatorSession = {
  get: () => current,
  set(session: CoordinatorSession | null) {
    current = session
    try {
      if (session) sessionStorage.setItem(KEY, JSON.stringify(session))
      else sessionStorage.removeItem(KEY)
    } catch {
      // storage unavailable: keep the in-memory session only
    }
    listeners.forEach((listener) => listener(session))
  },
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
