import {
  AlertTriangle,
  BrainCircuit,
  ClipboardList,
  CreditCard,
  Factory,
  FileClock,
  GitBranch,
  LayoutDashboard,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavBadgeSource = 'activeEmergencies' | 'pendingApprovals' | 'activeWorkflows'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: NavBadgeSource
  section: 'Operate' | 'Procure' | 'Control'
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Command Center', icon: LayoutDashboard, section: 'Operate' },
  { to: '/emergencies', label: 'Emergencies', icon: AlertTriangle, badge: 'activeEmergencies', section: 'Operate' },
  { to: '/requests', label: 'NGO Requests', icon: Users, section: 'Operate' },
  { to: '/demand', label: 'Demand', icon: ClipboardList, section: 'Operate' },
  { to: '/suppliers', label: 'Suppliers', icon: Factory, section: 'Operate' },
  { to: '/procurement', label: 'Collective Procurement', icon: ShoppingCart, section: 'Procure' },
  { to: '/agents', label: 'Agent Studio', icon: BrainCircuit, badge: 'activeWorkflows', section: 'Procure' },
  { to: '/replanning', label: 'Failure Recovery', icon: GitBranch, section: 'Procure' },
  { to: '/approvals', label: 'Approvals', icon: ShieldCheck, badge: 'pendingApprovals', section: 'Control' },
  { to: '/payments', label: 'Payments', icon: CreditCard, section: 'Control' },
  { to: '/fulfilment', label: 'Fulfilment', icon: Truck, section: 'Control' },
  { to: '/audit', label: 'Audit Trail', icon: FileClock, section: 'Control' },
]


export const NAV_SECTIONS = ['Operate', 'Procure', 'Control'] as const
