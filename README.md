# ReliefOS 2.0 — Collective Emergency Procurement

> **PayPal AI Hackathon 2026** · PayPal Sandbox · AI agents over a real MCP server · AG Grid

During a disaster, dozens of NGOs buy the same supplies separately, overpay, and lose track of deliveries.
**ReliefOS** turns many NGO requests into **one optimized, human-approved purchase**, pays for it with
**PayPal Sandbox**, and tracks every shipment until the NGO confirms receipt. When a supplier fails, AI agents
propose a revised plan, an independent agent re-validates it on fresh data, and a human decides.

| | |
|---|---|
| Demo video | **YouTube: _add link_** (file: [submission/ReliefOS_Demo.mp4](submission/ReliefOS_Demo.mp4)) |
| Code | `ReliefOS/` (this repository) |
| License | [MIT](LICENSE) |
| Submission text | [Project description (PDF)](submission/ReliefOS_Project_Description.pdf) · [Tools used (PDF)](submission/ReliefOS_Tools_Used.pdf) · [SUBMISSION.md](SUBMISSION.md) |
| Architecture | [ReliefOS/server/docs/ARCHITECTURE.md](ReliefOS/server/docs/ARCHITECTURE.md) |

## What it does

- **Collective procurement** — NGO requests are consolidated per product, duplicates flagged, supplier offers
  ranked, and a deterministic optimizer buys within budget and capacity and splits stock fairly across NGOs.
- **Human approval** — nothing is committed without a named coordinator's decision.
- **PayPal Sandbox payments** — INR plan totals are converted to USD at a dated Frankfurter rate; Orders API
  checkout, server-side capture, order verification and signed-webhook handling.
- **Delivery tracking** — every supplier → NGO shipment from dispatch to NGO receipt (short receipts recorded),
  with a timeline and a map of recorded coordinates.
- **Failure recovery** — a supplier failure (real or simulated) produces a versioned replacement or amendment
  proposal, independently revalidated, committed only on human approval.
- **AI agents + MCP** — six specialist agents and an orchestrator call 36 tools on our own MCP server; an LLM
  (Groq) explains every workflow in plain language. Claude Code can drive the same MCP server.
- **AG Grid** — every operational table (plans, shipments, payments, proposals, audit log…) with quick search,
  filters, money/quantity column types, pagination and CSV export.

## Run it locally (judges)

### Prerequisites
- Node.js **20+**, Python **3.11+**
- PostgreSQL — local, or a free [Neon](https://neon.tech) database
- A PayPal **Sandbox** REST app (developer.paypal.com → Apps & Credentials → Sandbox) and a sandbox **personal**
  (buyer) account to pay with
- Optional, for AI explanations: a free [Groq](https://console.groq.com) API key

### 1. API (Express + Prisma) — port 4000
```bash
cd ReliefOS/server
cp .env.example .env          # Windows: copy .env.example .env
#   DATABASE_URL, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET,
#   RELIEFOS_COORDINATOR_TOKEN (any secret string), RELIEFOS_AGENT_TOKEN (another secret string)
npm install
npx prisma migrate deploy
npx prisma generate
npx tsx prisma/seed.ts        # demo emergency, NGOs, suppliers, offers, requests (skips if data exists)
npm run dev
```

### 2. Agent service + MCP server (Python) — port 8001
```bash
cd ReliefOS/python-services
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Windows: copy .env.example .env
#   RELIEFOS_AGENT_TOKEN = same value as in server/.env
#   LLM_PROVIDER=groq  LLM_API_KEY=gsk_...   (optional; without it everything works, explanations are off)
uvicorn app.main:app --port 8001
```
Check: http://127.0.0.1:8001/health and http://127.0.0.1:8001/ai/status

### 3. Web app (React + Vite) — port 5173
```bash
cd ReliefOS/client
npm install
npm run dev
```
Open http://localhost:5173, click **Sign in** (top right) and paste `RELIEFOS_COORDINATOR_TOKEN`.

### 4. Try the flow (5 minutes)
1. **Collective Procurement** → *Flood Relief Operation*, budget `200000` → **Analyze** → **Optimize**
   (or **Run with agents**).
2. **Save draft** → **Submit for approval** → **Approvals** → **Approve**.
3. **Payments** → **Pay with PayPal Sandbox** → log in with your sandbox buyer → back in ReliefOS **Capture**.
4. **Fulfilment** → open a shipment → **Mark dispatched** → **Confirm NGO receipt**.
5. **Failure Recovery** → **Report failure** (try a simulation) → **Run replanning agents** → approve the proposal.
6. **Agent Studio** → open the run → **Replay** to watch the agents, read the AI explanation.

### Use the MCP server from Claude Code (optional)
With the agent service running, `ReliefOS/.mcp.json` connects Claude Code to `http://127.0.0.1:8001/mcp`.
Run `/mcp`, then use the `procurement-analysis` prompt.

### Tests
```bash
cd ReliefOS/server && TEST_DATABASE_URL=postgresql://localhost:5432/reliefos_test npm test   # never against production
cd ReliefOS/python-services && pytest
```

## Tech
React 19 · Vite · TanStack Query · AG Grid Community · Recharts · Leaflet · Express 5 · Prisma 6 · PostgreSQL (Neon) ·
PayPal Orders API (Sandbox) · Frankfurter FX · Python · FastAPI · MCP Python SDK (FastMCP) · Groq (openai/gpt-oss-120b)

## License
[MIT](LICENSE)
