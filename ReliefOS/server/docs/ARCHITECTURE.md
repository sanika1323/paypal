# ReliefOS 2.0 architecture

```
React (Vite :5173, AG Grid, Leaflet)
  │  /api            → Express :4000  (system of record, the only writer to Neon)
  │  /agent-service  → Python  :8001  (agents + MCP server)
  ▼
Express + Prisma ──► Neon PostgreSQL
  ├─ PayPal Sandbox (orders, capture, signed webhooks)
  └─ Frankfurter (dated INR→USD reference rate)

Python agent service (python-services/)
  FastAPI ── Orchestrator ─► Demand · Supplier · Allocation · Fulfilment · Replanning · Revalidation agents
          │                 (each has an allow-list of MCP tools; calls go through a real MCP ClientSession)
          ├─ MCP server (FastMCP, Streamable HTTP at /mcp + stdio): 36 tools, 5 resources, 4 prompts
          ├─ Policy guard: scoped tokens (read / write); no tool can approve, reject, pay or confirm delivery
          └─ LLM adapter (optional Anthropic): narrative explanations only, never numbers or decisions
```

## Trust boundaries

| Action | Who | Where enforced |
|---|---|---|
| Create DRAFT plan, submit for approval | agent or coordinator | `requireAgentOrCoordinator` |
| Approve / reject plan or proposal | coordinator only | `requireCoordinator` (agents get 403 `FORBIDDEN_FOR_AGENTS`) |
| PayPal checkout / capture / reconcile | coordinator only | `requireCoordinator` |
| Report a REAL supplier failure | coordinator only | `reportSupplierFailure` (`AGENTS_MAY_ONLY_SIMULATE`) |
| Delivery status, NGO receipt | coordinator only | `requireCoordinator`; DELIVERED only via `/receipt` |
| Catalog writes (vendors, offers, requests…) | coordinator only | `guardWrites(requireCoordinator)` |
| Workflow traces, proposals, validation reports | agent or coordinator | `requireAgentOrCoordinator` |

The Python service never touches PostgreSQL; every write goes through the API above.

## Replanning and revalidation

1. A supplier failure is reported (real by a coordinator, or a labelled simulation).
2. `GET /api/supplier-failures/:id/affected` lists plans, purchases, NGOs and deliveries hit.
3. `POST /api/replanning/proposals` runs the same deterministic optimizer:
   * **REPLACEMENT** for an unpaid plan (whole plan re-optimized),
   * **AMENDMENT** for a paid plan (only FAILED / short-delivered quantity; the paid plan is never altered).
   The proposal stores the source plan version, input fingerprint and an original-vs-revised comparison.
4. `POST /api/replanning/proposals/:id/validations` recomputes on fresh data (version, availability,
   capacity, price, delivery constraint, quantities, NGO allocation, budget, reproducibility). The
   Revalidation Agent submits its own checks; any disagreement becomes `REQUIRES_HUMAN_REVIEW` and a
   server rejection always stands.
5. A coordinator approves in **Approvals**. Approval re-validates again and checks the plan version
   (optimistic concurrency); only then is the revised plan committed (`revisionOfId` → source plan).
   A replaced plan becomes CANCELLED and stays as history.

## Delivery lifecycle

PENDING → DISPATCHED → IN_TRANSIT → (DELAYED) → DELIVERED (only by NGO receipt with received quantity)
or FAILED (reason required). Payment does not imply dispatch. A short receipt is recorded as such and
its shortfall is eligible for an AMENDMENT proposal. The map shows recorded coordinates only.

## Idempotency

Writes that agents may retry accept an `Idempotency-Key` header (plans, proposals, failures, workflows,
receipts). A replay returns the stored response with `Idempotent-Replayed: true`; reusing a key with a
different body is `409 IDEMPOTENCY_KEY_REUSED`. The Python tools derive keys from the workflow id.
