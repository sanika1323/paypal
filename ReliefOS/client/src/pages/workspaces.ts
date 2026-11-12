import type { WorkspaceSpec } from './PlannedWorkspace'

export const WORKSPACES: Record<string, WorkspaceSpec> = {
  command: {
    eyebrow: 'Command Center',
    title: 'Welcome back to ReliefOS',
    description: 'Turning fragmented emergency purchasing into intelligent, coordinated, and accountable commerce.',
    phase: 3,
    sources: ['GET /api/emergencies', 'GET /api/relief-requests', 'GET /api/procurement/plans', 'GET /api/approvals'],
  },
  emergencies: {
    eyebrow: 'Field operations',
    title: 'Emergencies',
    description: 'Registered emergencies, their severity, and the NGO demand and plans attached to each.',
    phase: 3,
    sources: ['GET /api/emergencies', 'GET /api/emergencies/:id', 'PATCH /api/emergencies/:id/status'],
  },
  requests: {
    eyebrow: 'Community needs',
    title: 'NGO Requests',
    description: 'Individual NGO relief requests that ReliefOS consolidates into one collective demand.',
    phase: 3,
    sources: ['GET /api/relief-requests', 'GET /api/organizations', 'GET /api/products'],
  },
  procurement: {
    eyebrow: 'Core workflow',
    title: 'Collective Procurement',
    description: 'NGO demand → aggregation → supplier evaluation → deterministic optimization → allocation → approval → payment.',
    phase: 4,
    sources: [
      'POST /api/agents/demand',
      'POST /api/agents/suppliers',
      'POST /api/procurement/optimize',
      'POST /api/procurement/plans',
      'POST /api/procurement/plans/:id/submit',
    ],
  },
  agents: {
    eyebrow: 'Agent network',
    title: 'Agent Intelligence',
    description: 'Run the Demand, Supplier, Allocation and Fulfilment agents individually or through the Orchestrator.',
    phase: 5,
    sources: [
      'POST /api/agents/demand',
      'POST /api/agents/suppliers',
      'POST /api/agents/allocate',
      'POST /api/agents/fulfilment',
      'POST /api/agents/orchestrate',
    ],
  },
  approvals: {
    eyebrow: 'Accountability',
    title: 'Human Approvals',
    description: 'No procurement proceeds without an explicit human decision.',
    phase: 6,
    sources: ['GET /api/approvals', 'POST /api/approvals/:id/approve', 'POST /api/approvals/:id/reject'],
  },
  payments: {
    eyebrow: 'Financial operations',
    title: 'Payments & Audit',
    description: 'INR procurement accounting with dated INR→USD conversion for PayPal Sandbox checkout.',
    phase: 7,
    sources: [
      'POST /api/payments/plans/:planId/checkout',
      'GET /api/payments/:paymentId',
      'GET /api/payments/:paymentId/verify-paypal-order',
      'POST /api/payments/:paymentId/capture',
    ],
  },
  paymentReturn: {
    eyebrow: 'PayPal Sandbox',
    title: 'Checkout return',
    description: 'PayPal redirects here after the payer approves or cancels a Sandbox order.',
    phase: 7,
    sources: ['GET /api/payments/:paymentId/verify-paypal-order', 'POST /api/payments/:paymentId/capture'],
  },
  fulfilment: {
    eyebrow: 'Outcomes',
    title: 'Fulfilment & Impact',
    description: 'Purchased, allocated and delivered quantities derived from persisted procurement records.',
    phase: 8,
    sources: ['POST /api/agents/fulfilment', 'GET /api/procurement/plans'],
  },
}
