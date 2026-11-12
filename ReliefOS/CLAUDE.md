# ReliefOS 2.0 — notes for Claude

ReliefOS is a collective emergency procurement network: many NGO requests become one deterministic,
human-approved purchase, paid with PayPal Sandbox and tracked to NGO receipt. Supplier failures become
versioned, independently revalidated replanning proposals that only a human can commit.

## Layout

- `server/` — Express 5 + Prisma + Neon. System of record and the ONLY writer to the database: optimizer,
  plans, approvals, PayPal, webhooks, deliveries, supplier failures, replanning proposals, validation,
  workflow traces, audit log. `docs/ARCHITECTURE.md` describes the trust boundaries.
- `python-services/` — FastAPI agent service on :8001 (Orchestrator + Demand, Supplier, Allocation,
  Fulfilment, Replanning, Revalidation agents) and the MCP server (Streamable HTTP at `/mcp`, or stdio).
- `client/` — React + Vite + AG Grid + Leaflet.

## Using the MCP server from Claude Code

`.mcp.json` connects to the MCP server at `http://127.0.0.1:8001/mcp` (start the agent service first). Run `/mcp` to confirm
`reliefos` is connected. Useful prompts: `procurement-analysis`, `supplier-failure-recovery`,
`proposal-revalidation`, `supplier-risk-explanation`. Read `reliefos://playbook` first.

## Rules

1. Never invent numbers. Quantities, prices, costs and allocations come only from tool results; the optimizer
   is authoritative.
2. Agents cannot approve, reject, pay, capture, report REAL failures, change delivery status or confirm
   receipts. No MCP tool does that; tell the human what to do in the UI.
3. `report_supplier_failure` always records a labelled SIMULATION. Simulations never change stored data and
   can never be submitted or committed.
4. A paid plan is never altered: shortfalls get an AMENDMENT plan with its own approval and payment.
5. Never run `prisma migrate reset`, never delete migrations or demo records, never print secrets.

## Commands (Windows PowerShell)

```powershell
cd server;  npm run dev                                   # :4000
cd python-services; .venv\Scripts\activate; uvicorn app.main:app --port 8001
cd client;  npm run dev                                   # :5173
cd server;  $env:TEST_DATABASE_URL="postgresql://...local..."; npm test   # refuses Neon
cd python-services; pytest                                # unit tests; set RELIEFOS_E2E_* for integration
```

## Conventions

- Business rules live in `server/`. The Python service calls the REST API with `X-Service-Token`.
- Amounts are INR Decimal strings; PayPal checkout converts to USD on the server with a dated rate.
- Every plan status change increments `ProcurementPlan.version`.
- New writes that agents may retry should accept `Idempotency-Key` (`middleware/idempotency.ts`).
