import { Route, Routes } from 'react-router-dom'

import { AppShell } from './components/layout/AppShell'
import { NotFound } from './pages/NotFound'
import { PlannedWorkspace } from './pages/PlannedWorkspace'
import { WORKSPACES } from './pages/workspaces'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<PlannedWorkspace spec={WORKSPACES.command} />} />
        <Route path="emergencies" element={<PlannedWorkspace spec={WORKSPACES.emergencies} />} />
        <Route path="requests" element={<PlannedWorkspace spec={WORKSPACES.requests} />} />
        <Route path="procurement" element={<PlannedWorkspace spec={WORKSPACES.procurement} />} />
        <Route path="agents" element={<PlannedWorkspace spec={WORKSPACES.agents} />} />
        <Route path="approvals" element={<PlannedWorkspace spec={WORKSPACES.approvals} />} />
        <Route path="payments" element={<PlannedWorkspace spec={WORKSPACES.payments} />} />
        {/* PayPal return_url / cancel_url from server/.env.example */}
        <Route path="payments/success" element={<PlannedWorkspace spec={WORKSPACES.paymentReturn} />} />
        <Route path="payments/cancel" element={<PlannedWorkspace spec={WORKSPACES.paymentReturn} />} />
        <Route path="fulfilment" element={<PlannedWorkspace spec={WORKSPACES.fulfilment} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
