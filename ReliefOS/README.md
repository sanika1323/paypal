# ReliefOS 2.0

Collective emergency procurement for NGOs: consolidate demand, buy once at the best stored supplier
offers, approve as a human, pay with PayPal Sandbox, and track every shipment to NGO receipt. When a
supplier fails, agents produce a versioned replanning proposal that is independently revalidated on fresh
data and committed only after a human approves it.

## Components

| Part | Stack | Port |
|---|---|---|
| `server/` | Express 5, Prisma 6, Neon PostgreSQL, PayPal Orders API + webhooks, Frankfurter | 4000 |
| `python-services/` | FastAPI, official MCP Python SDK (FastMCP), httpx, optional Anthropic | 8001 |
| `client/` | React 19, Vite, TanStack Query, AG Grid Community, Leaflet | 5173 |

See `server/docs/ARCHITECTURE.md` for the trust boundaries, replanning flow and delivery lifecycle.

## Setup (Windows)

```powershell
# 1. API
cd server
copy .env.example .env      # fill DATABASE_URL, PayPal Sandbox keys, RELIEFOS_COORDINATOR_TOKEN, RELIEFOS_AGENT_TOKEN
npm install
npx prisma migrate deploy   # applies only new migrations; never use migrate reset
npx prisma generate
npm run dev

# 2. Agent service + MCP server
cd ..\python-services
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env      # RELIEFOS_AGENT_TOKEN must equal the server's
uvicorn app.main:app --port 8001

# 3. UI
cd ..\client
npm install
npm run dev                 # http://localhost:5173 — sign in (top right) with the coordinator token
```

## Demo script

1. **Overview** — live counts from stored records.
2. **Demand Intelligence** — pick *Flood Relief Operation*: consolidated demand, duplicates flagged.
3. **Suppliers** — stored offers and documented risk scores (unrated suppliers are scored on failures only).
4. **Procurement** — budget ₹2,00,000 → optimizer buys 300 boxes from Bihar Emergency Traders at ₹165 = ₹49,500.
   *Run with agents* does the same through the Python agents and stops at **WAITING_FOR_HUMAN**.
5. **Approvals** — a named coordinator approves.
6. **Payments** — PayPal Sandbox checkout in USD at a dated Frankfurter rate; capture creates PENDING deliveries.
7. **Replanning** — record a *simulation* (Bihar unavailable): the proposal and comparison are shown, nothing changes.
   Then report a real failure on an unpaid plan and *Run replanning agents*: Replanning Agent proposes, Revalidation
   Agent checks independently, the server recomputes, and the proposal waits in Approvals. Approving cancels the
   original (kept as history) and commits the revised plan. For a paid plan the result is an AMENDMENT.
8. **Fulfilment & Delivery** — dispatch, delay with a reason, confirm NGO receipt (short receipts are recorded),
   timeline per delivery, CSV export, map of recorded coordinates.
9. **Agent Activity** — every workflow step labelled as MCP tool call, deterministic rule, AI explanation or
   human decision; resume after a human decides.
10. **Audit Trail** — every server-side event.

## Tests

```powershell
cd server; $env:TEST_DATABASE_URL="postgresql://postgres@localhost:5432/reliefos_test"; npm test
cd python-services; pytest
```

Server tests refuse to run without `TEST_DATABASE_URL` or against a Neon host. Python integration tests need
`RELIEFOS_E2E_API_URL` pointing at a **local** API.
