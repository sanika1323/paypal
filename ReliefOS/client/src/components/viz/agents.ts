import { Boxes, ClipboardList, Factory, GitBranch, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'

export const AGENTS: Array<{ id: string; label: string; icon: LucideIcon; color: string }> = [
  { id: 'DEMAND_AGENT', label: 'Demand', icon: ClipboardList, color: '#22d3ee' },
  { id: 'SUPPLIER_AGENT', label: 'Supplier', icon: Factory, color: '#3b82f6' },
  { id: 'ALLOCATION_AGENT', label: 'Allocation', icon: Boxes, color: '#8b5cf6' },
  { id: 'FULFILMENT_AGENT', label: 'Fulfilment', icon: Truck, color: '#10b981' },
  { id: 'REPLANNING_AGENT', label: 'Replanning', icon: GitBranch, color: '#f59e0b' },
  { id: 'REVALIDATION_AGENT', label: 'Revalidation', icon: ShieldCheck, color: '#f472b6' },
]
