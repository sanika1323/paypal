import { useEmergencies } from '../../hooks/queries'

interface EmergencySelectProps {
  value: string
  onChange: (id: string) => void
  label?: string
  activeOnly?: boolean
}

export function EmergencySelect({ value, onChange, label = 'Emergency', activeOnly = true }: EmergencySelectProps) {
  const emergencies = useEmergencies()
  const options = (emergencies.data ?? []).filter((e) => !activeOnly || e.isActive)
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} required>
        <option value="">{emergencies.isLoading ? 'Loading…' : options.length ? 'Select an emergency' : 'No active emergencies'}</option>
        {options.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name} · {e.location}
          </option>
        ))}
      </select>
    </label>
  )
}
