import { AlertTriangle, Building2, FileText, Search, Truck } from 'lucide-react'
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useEmergencies, useProcurementPlans, useReliefRequests, useVendors } from '../../hooks/queries'
import { humanize } from '../../lib/format'

interface SearchResult {
  key: string
  label: string
  meta: string
  kind: 'Emergency' | 'NGO' | 'Plan' | 'Supplier'
  to: string
}

const KIND_ICON = {
  Emergency: AlertTriangle,
  NGO: Building2,
  Plan: FileText,
  Supplier: Truck,
}

// Client-side search across records already fetched from the API. There is no search endpoint.
export function GlobalSearch() {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const emergencies = useEmergencies()
  const requests = useReliefRequests()
  const plans = useProcurementPlans()
  const vendors = useVendors()

  const results = useMemo<SearchResult[]>(() => {
    const query = term.trim().toLowerCase()
    if (query.length < 2) return []
    const matches = (...fields: Array<string | null | undefined>) =>
      fields.some((field) => field?.toLowerCase().includes(query))

    const out: SearchResult[] = []
    for (const item of emergencies.data ?? []) {
      if (matches(item.name, item.location, item.severity))
        out.push({ key: `e-${item.id}`, label: item.name, meta: item.location, kind: 'Emergency', to: '/emergencies' })
    }
    const seenOrgs = new Set<string>()
    for (const request of requests.data ?? []) {
      const org = request.organization
      if (seenOrgs.has(org.id)) continue
      if (matches(org.name, org.location)) {
        seenOrgs.add(org.id)
        out.push({ key: `o-${org.id}`, label: org.name, meta: org.location ?? org.type, kind: 'NGO', to: '/requests' })
      }
    }
    for (const plan of plans.data ?? []) {
      if (matches(plan.name, plan.emergency.name, plan.status))
        out.push({ key: `p-${plan.id}`, label: plan.name, meta: humanize(plan.status), kind: 'Plan', to: '/procurement' })
    }
    for (const vendor of vendors.data ?? []) {
      if (matches(vendor.name, vendor.location))
        out.push({ key: `v-${vendor.id}`, label: vendor.name, meta: vendor.location, kind: 'Supplier', to: '/procurement' })
    }
    return out.slice(0, 8)
  }, [term, emergencies.data, requests.data, plans.data, vendors.data])

  const go = (result: SearchResult) => {
    navigate(result.to)
    setOpen(false)
    setTerm('')
    inputRef.current?.blur()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((value) => Math.min(value + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((value) => Math.max(value - 1, 0))
    } else if (event.key === 'Enter' && results[cursor]) {
      go(results[cursor])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const showPanel = open && term.trim().length >= 2

  return (
    <div className="search">
      <Search size={18} className="search__icon" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        className="search__input"
        placeholder="Search emergencies, NGOs, procurement plans, suppliers…"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value)
          setCursor(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        aria-label="Search ReliefOS records"
        aria-expanded={showPanel}
        role="combobox"
        aria-controls="search-results"
      />
      {showPanel && (
        <ul className="search__results" id="search-results" role="listbox">
          {results.length === 0 ? (
            <li className="search__empty">No matching records</li>
          ) : (
            results.map((result, index) => {
              const Icon = KIND_ICON[result.kind]
              return (
                <li key={result.key} role="option" aria-selected={index === cursor}>
                  <button
                    type="button"
                    className={`search__result${index === cursor ? ' search__result--active' : ''}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => go(result)}
                  >
                    <Icon size={16} />
                    <span className="search__label">{result.label}</span>
                    <span className="search__meta">{result.meta}</span>
                    <span className="search__kind">{result.kind}</span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
