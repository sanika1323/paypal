# ReliefOS 2.0 — API → UI Mapping

Source of truth: `server/src/routes/*`, `server/src/controllers/*`, `server/src/services/**`, `server/prisma/schema.prisma` (inspected 2026-11-11).

All responses use the envelope `{ success: boolean, message?: string, count?: number, data: T }`.
Prisma `Decimal` fields arrive as **strings** (e.g. `"49500.00"`); `DateTime` arrives as ISO strings.
Errors return `{ success: false, message }` — payment errors return a machine code in `message` (e.g. `PLAN_NOT_APPROVED`).

## 1. Endpoint inventory (verified)

| Method | Path | Body / query | `data` shape |
|---|---|---|---|
| GET | `/api/health` | — | *(no envelope)* `{ success, application, api, database: "connected"\|"disconnected", timestamp }` — 503 when DB down |
| GET | `/api/emergencies` | — | `Emergency[]` + `_count{requests,plans}` |
| GET | `/api/emergencies/:id` | — | `Emergency` + `requests[]{organization,product}` + `plans[]` + `_count` |
| POST | `/api/emergencies` | `{name, description?, location, severity}` | `Emergency` |
| PATCH | `/api/emergencies/:id` | partial of above | `Emergency` |
| PATCH | `/api/emergencies/:id/status` | `{isActive: boolean}` | `Emergency` |
| GET/POST/PATCH/DELETE | `/api/organizations[/:id]` | — | `Organization` + `_count{requests,allocations}` |
| GET/POST/PATCH/DELETE | `/api/products[/:id]` | — | `Product` + `_count{requests,offers}` |
| GET | `/api/relief-requests` | `?organizationId&emergencyId&status` | `ReliefRequest[]{organization,emergency,product}` |
| POST/PATCH | `/api/relief-requests[/:id]` | — | `ReliefRequest` |
| GET/POST/PATCH | `/api/vendors[/:id]` | — | `Vendor` + `_count{offers}` |
| GET | `/api/vendor-offers` | `?vendorId&productId` | `VendorOffer[]{vendor,product}` |
| POST | `/api/procurement/optimize` | `{emergencyId, budget, maxDeliveryDays?}` | `OptimizationResult` (preview, nothing persisted) |
| POST | `/api/procurement/plans` | same as optimize | `ProcurementPlan` (DRAFT; 400 if budget exceeded or capacity short) |
| GET | `/api/procurement/plans` | — | `ProcurementPlan[]` with `emergency, items{product, purchases{vendorOffer{vendor}}, allocations{organization}}, approvals, payments` |
| GET | `/api/procurement/plans/:id` | — | same, plus `allocations.reliefRequest`, `vendorOffer.product` |
| POST | `/api/procurement/plans/:id/submit` | — | plan → `PENDING_APPROVAL`, creates placeholder Approval |
| GET | `/api/approvals` | — | `Approval[]` where plan is `PENDING_APPROVAL`, with `plan{emergency, items{product,purchases{vendorOffer{vendor,product}}}}` |
| POST | `/api/approvals/:approvalId/approve` | `{approvedBy, comments?}` | `{ approval, planStatus }` |
| POST | `/api/approvals/:approvalId/reject` | `{approvedBy, comments}` (reason required) | `{ approval, planStatus }` |
| POST | `/api/agents/demand` | `{emergencyId}` | `DemandAgentResult` |
| POST | `/api/agents/suppliers` | `{emergencyId}` | `SupplierAgentResult` |
| POST | `/api/agents/allocate` | `{emergencyId, budget, maxDeliveryDays?}` | `AllocationAgentResult` (preview) |
| POST | `/api/agents/fulfilment` | `{emergencyId}` | `FulfilmentAgentResult` (read-only) |
| POST | `/api/agents/orchestrate` | `{emergencyId, budget, maxDeliveryDays?}` | `OrchestratorResult` — HTTP 207 + `success:false` when PARTIAL |
| POST | `/api/payments/plans/:planId/checkout` | — | `{paymentId, orderId, approvalUrl, originalAmountINR, amountUSD, exchangeRate, exchangeRateDate, exchangeRateProvider, currency}` |
| GET | `/api/payments/:paymentId` | — | `Payment` + `plan{id,name,status,emergencyId}` |
| GET | `/api/payments/:paymentId/verify-paypal-order` | — | `{paymentId, orderId, localPaymentStatus, paypalOrderStatus, amountUSD, …exchange fields, approvalUrl, captured}` |
| POST | `/api/payments/:paymentId/capture` | — | `{paymentId, status, captureId, amount?, currency?, alreadyCompleted}` |

PayPal return URLs (from `server/.env.example`): `/payments/success`, `/payments/cancel` on the client → the client must own these routes.

## 2. Screen mapping

| UI element | Source | Notes |
|---|---|---|
| **Header – connection indicator** | `GET /api/health` (poll 30 s) | Shows API + DB separately; 503 → "Database disconnected"; network error → "API unreachable" |
| **Header – notifications** | `GET /api/approvals` | Only real actionable items: plans awaiting human approval. No notification API exists. |
| **Header – search** | Cached `emergencies`, `relief-requests`, `procurement/plans`, `vendors` | Client-side filter over already-fetched records. No search endpoint. |
| **Header – user** | — | **Not rendered.** No auth/user endpoint exists. |
| **Sidebar badges** | `emergencies` (isActive), `approvals` (count) | |
| Command Center – Active emergencies | `GET /api/emergencies` → `isActive` count | |
| – NGO requests / pending | `GET /api/relief-requests` → length, `status==='PENDING'` | |
| – Procurement plans / value | `GET /api/procurement/plans` → length, Σ`totalCost` (INR) | |
| – Budget utilization | Σ`totalCost` / Σ`totalBudget` over plans | Derived; no trend (no history endpoint) |
| – Pending approvals | `GET /api/approvals` length | |
| – Emergency panel | `GET /api/emergencies` + `_count` | **No map**: schema has text `location` only, no coordinates |
| – Recent activity | Plan / approval / payment `createdAt`/`updatedAt` timestamps | **Gap:** `AuditLog` table has no read endpoint |
| Collective Procurement – demand | `POST /api/agents/demand` | |
| – supplier comparison | `POST /api/agents/suppliers` (ranked offers) | |
| – optimization preview | `POST /api/procurement/optimize` | Label: *Deterministic optimizer* |
| – save plan | `POST /api/procurement/plans` | |
| – submit for approval | `POST /api/procurement/plans/:id/submit` | |
| AI Agent Intelligence | `POST /api/agents/*` and `/orchestrate` | `stages[]` gives status, timings, errors |
| Human Approvals | `GET /api/approvals`, approve/reject mutations | `approvedBy` must be typed by the reviewer (no auth) |
| Approval history | `plan.approvals[]` from `GET /api/procurement/plans` | |
| Payments & Audit | `plan.payments[]`, `GET /api/payments/:id`, verify, checkout, capture | Exchange data is stored on Payment |
| Fulfilment & Impact | `POST /api/agents/fulfilment` + plan `items`/`allocations` | Delivery rows come only via payments→deliveries |

## 3. Gaps — features with no supporting API (not faked in UI)

1. **No LLM/AI in any agent.** All five agents are deterministic TypeScript (grouping, sorting, proportional allocation). The UI labels them as rule-based agents; there is no "AI-generated recommendation" to display.
2. **Agent runs are not persisted** (except orchestrator → `AuditLog`). Agent status is only known for runs made in the current browser session.
3. **No `GET` for `AuditLog`.** Audit history (plan created, submitted, approved, PayPal order, capture) is written but unreadable from the client.
4. **No delivery API.** `Delivery` rows can't be created or updated via REST; only read indirectly through the Fulfilment Agent.
5. **No PayPal webhook route** despite `PAYPAL_WEBHOOK_ID` in `.env.example`. Capture is client-triggered via `/capture`.
6. **No list-payments endpoint**; payments are reachable only through `plan.payments[]`.
7. **No auth / current-user endpoint.** Approver identity is free text.
8. **No geo coordinates** on Emergency / Organization / Vendor → no accurate map possible.
9. **No historical snapshots** → no week-over-week trends.
10. Dead imports in `procurement.routes.ts` (none harmful); `approval.routes.ts` imports `submitPlanForApprovalController` unused.
