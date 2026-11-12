import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AppShell } from './components/layout/AppShell'
import { LoadingSkeleton } from './components/ui/States'
import { NotFound } from './pages/NotFound'

// AG Grid and Leaflet are large; workspaces load on demand.
const named = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) =>
  lazy(() => load().then((module) => ({ default: module[name] })))

const OverviewPage = named(() => import('./pages/OverviewPage'), 'OverviewPage')
const EmergenciesPage = named(() => import('./pages/RecordsPages'), 'EmergenciesPage')
const RequestsPage = named(() => import('./pages/RecordsPages'), 'RequestsPage')
const DemandPage = named(() => import('./pages/DemandPage'), 'DemandPage')
const SuppliersPage = named(() => import('./pages/SuppliersPage'), 'SuppliersPage')
const ProcurementPage = named(() => import('./pages/ProcurementPage'), 'ProcurementPage')
const ReplanningPage = named(() => import('./pages/ReplanningPage'), 'ReplanningPage')
const ApprovalsPage = named(() => import('./pages/ApprovalsPage'), 'ApprovalsPage')
const PaymentsPage = named(() => import('./pages/PaymentsPage'), 'PaymentsPage')
const PaymentReturnPage = named(() => import('./pages/PaymentsPage'), 'PaymentReturnPage')
const FulfilmentPage = named(() => import('./pages/FulfilmentPage'), 'FulfilmentPage')
const AgentActivityPage = named(() => import('./pages/AgentActivityPage'), 'AgentActivityPage')
const AuditPage = named(() => import('./pages/AuditPage'), 'AuditPage')

const page = (element: ReactNode) => (
  <Suspense
    fallback={
      <div className="page">
        <LoadingSkeleton rows={4} height={120} />
      </div>
    }
  >
    {element}
  </Suspense>
)

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={page(<OverviewPage />)} />
        <Route path="emergencies" element={page(<EmergenciesPage />)} />
        <Route path="requests" element={page(<RequestsPage />)} />
        <Route path="demand" element={page(<DemandPage />)} />
        <Route path="suppliers" element={page(<SuppliersPage />)} />
        <Route path="procurement" element={page(<ProcurementPage />)} />
        <Route path="replanning" element={page(<ReplanningPage />)} />
        <Route path="approvals" element={page(<ApprovalsPage />)} />
        <Route path="payments" element={page(<PaymentsPage />)} />
        {/* PayPal return_url / cancel_url (server/.env.example) */}
        <Route path="payments/success" element={page(<PaymentReturnPage />)} />
        <Route path="payments/cancel" element={page(<PaymentReturnPage />)} />
        <Route path="fulfilment" element={page(<FulfilmentPage />)} />
        <Route path="agents" element={page(<AgentActivityPage />)} />
        <Route path="audit" element={page(<AuditPage />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
