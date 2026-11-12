# ReliefOS 2.0 — Devpost submission text

_Copy each section into the matching Devpost field._

## Tagline
Many NGO requests, one optimized purchase — paid with PayPal, orchestrated by AI agents, approved by humans.

## Inspiration
When a flood or cyclone hits, dozens of NGOs scramble for the same water, food and shelter. Each one buys
separately, pays more, competes for the same supplier stock and loses track of what actually arrived. We wanted
one shared system where demand is pooled, money moves safely, and every unit is accounted for until an NGO
confirms it received it.

## What it does
- **Collective demand** — NGO relief requests for an emergency are consolidated per product and ranked by
  urgency; duplicate or conflicting requests are flagged, never silently merged.
- **Supplier comparison** — stored offers are ranked by price, delivery time and reliability, with a documented
  risk score from real failure history. Unavailable or expired offers are excluded with a reason.
- **Optimized purchase** — a deterministic optimizer buys within budget and capacity and splits stock fairly
  across NGOs (largest remainder). The demand flow is shown as an NGO → product → supplier Sankey.
- **Human approval** — plans and replanning proposals only proceed after a named coordinator approves.
- **PayPal Sandbox payment** — INR totals are converted to USD at a dated reference rate (Frankfurter),
  paid through the PayPal Orders API, captured server-side, verified against PayPal, and confirmed by signed
  webhooks. Capture creates the delivery records.
- **Delivery tracking** — each supplier → NGO shipment moves from dispatch to NGO receipt; short deliveries are
  recorded, with a timeline per shipment and a map of recorded locations.
- **Supplier failure recovery** — a failure (reported, or simulated as a what-if) produces a versioned proposal:
  a **replacement** for unpaid plans or an **amendment** that covers only the shortfall for paid plans. An
  independent Revalidation Agent and a server recomputation check it on fresh data; a human commits it.
- **Agent Studio** — watch the agents work: an animated agent network, a step-by-step replay of every tool call,
  and an AI-written explanation of each run.
- **Audit trail** — every plan, approval, PayPal step, webhook, delivery change and decision is logged.

## How we built it
- **Frontend:** React 19 + Vite, TanStack Query, **AG Grid Community** for every operational table (quick search,
  column filters, money/quantity column types, pagination, CSV export, custom dark theme), Recharts (Sankey,
  donuts, area/bar charts), Leaflet map.
- **API:** Express 5 + Prisma 6 on PostgreSQL (Neon). It is the only writer to the database and owns the
  optimizer, approvals, PayPal integration, deliveries, replanning, validation, idempotency keys, optimistic
  plan versioning and the audit log.
- **PayPal:** Orders API v2 (create, verify, capture) in the **Sandbox**, webhook signature verification, a
  coordinator-only checkout, and a dated INR→USD rate stored with every payment.
- **Agents:** a Python FastAPI service with an Orchestrator plus Demand, Supplier, Allocation, Fulfilment,
  Replanning and Revalidation agents. Each agent has an allow-list of tools and calls them through a real MCP
  client session; every step is persisted as a trace. Workflows stop at a human-approval checkpoint and resume
  after the human decides.
- **MCP server:** built with the official MCP Python SDK (FastMCP), served over Streamable HTTP (`/mcp`) and
  stdio, with 36 tools, 5 resources and 4 prompts, read/write scopes and bearer-token auth.

## AI tools used and how
- **Groq — `openai/gpt-oss-120b`** (via an OpenAI-compatible adapter): writes the plain-language explanation of
  every agent workflow (procurement and failure recovery), shown in Agent Studio and labelled as AI. It is given
  only the tool results and is instructed never to invent numbers.
- **Model Context Protocol (MCP)** — our own MCP server exposes ReliefOS as tools, resources and prompts. Our
  Python agents use it, and any MCP client can too: **Claude Code** connects through `.mcp.json` and can run the
  `procurement-analysis` or `supplier-failure-recovery` prompts against live data.
- **Claude (Anthropic)** helped us design and write code during development.
- **Guardrails by design:** the AI explains; it does not decide. Prices, quantities and allocations come from the
  deterministic optimizer, and no MCP tool can approve, reject, pay, capture or confirm delivery. Agents can only
  record *simulated* supplier failures.

## Challenges we ran into
- Keeping AI useful without letting it touch money: we separated explanation (LLM), proposal and validation
  (agents + deterministic optimizer) and commitment (human).
- Replanning a plan that is already paid without rewriting financial history — solved with amendment plans that
  cover only the failed or short-delivered quantity.
- Concurrency and retries: plan versions, revalidation at approval time and idempotency keys so an agent retry
  never creates a duplicate.

## Accomplishments that we're proud of
- An end-to-end flow on real persisted data: demand → optimization → approval → PayPal Sandbox → delivery → receipt.
- Independent revalidation: the server's recomputation and the Revalidation Agent must agree, or a human reviews.
- 21 API tests and 23 Python tests, including MCP discovery, scope enforcement and full agent workflows.

## What we learned
MCP makes a clean boundary between AI and a system of record: the same tools serve our agents, Claude Code and
any other client, and the permissions live in one place.

## What's next for ReliefOS
Live PayPal payouts to suppliers, supplier self-service offers, SMS receipt confirmation for NGOs in the field,
and multi-currency budgets.

## Built with
react · vite · typescript · ag-grid · recharts · leaflet · express · prisma · postgresql · neon · paypal-orders-api ·
python · fastapi · mcp · groq · gpt-oss · frankfurter

## Links
- Repository: https://github.com/sanika1323/paypal
- Demo video: https://youtu.be/lyaBco3FCW8
