import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavBadgeSource = 'activeEmergencies' | 'pendingApprovals'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: NavBadgeSource
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Command Center', icon: LayoutDashboard },
  { to: '/emergencies', label: 'Emergencies', icon: AlertTriangle, badge: 'activeEmergencies' },
  { to: '/requests', label: 'NGO Requests', icon: Users },
  { to: '/procurement', label: 'Collective Procurement', icon: ShoppingCart },
  { to: '/agents', label: 'Agent Intelligence', icon: BrainCircuit },
  { to: '/approvals', label: 'Human Approvals', icon: ShieldCheck, badge: 'pendingApprovals' },
  { to: '/payments', label: 'Payments & Audit', icon: CreditCard },
  { to: '/fulfilment', label: 'Fulfilment & Impact', icon: BarChart3 },
]
