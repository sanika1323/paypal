"""Read-only MCP resources. Each fetch is live from the ReliefOS API (agent scope, read-only routes)."""
import json

from ..integrations.backend_client import BackendClient
from .server import mcp

PLAYBOOK = """# ReliefOS procurement playbook

1. Demand comes only from persisted NGO relief requests. Duplicates are flagged, never merged silently.
2. Supplier quantities, prices and lead times come only from stored vendor offers.
3. Purchasing is decided by the deterministic optimizer: lowest unit price, then fastest delivery, then
   supplier name; greedy within capacity and budget; NGO shares by largest remainder.
4. Agents may create DRAFT plans, submit plans for approval, generate replanning proposals, file
   validation reports and record SIMULATED supplier failures.
5. Only a human coordinator may approve or reject plans and proposals, start or capture PayPal payments,
   report real supplier failures, change delivery status and confirm NGO receipt.
6. A paid plan is never altered. Shortfalls on a paid plan are covered by an AMENDMENT plan that needs its
   own approval and payment. An unpaid plan may be REPLACED, and the original is kept as CANCELLED history.
7. Every replanning proposal is independently revalidated on fresh data. The server's rejection always
   stands; disagreement between the agent and the server goes to human review.
8. Simulations are labelled and never change stored offers, plans, payments or deliveries.
"""


async def _get(path: str) -> str:
    async with BackendClient() as api:
        return json.dumps(await api.get(path), default=str, indent=2)


@mcp.resource("reliefos://playbook", name="playbook", title="Procurement playbook", mime_type="text/markdown")
def playbook() -> str:
    """Rules every ReliefOS agent and operator follows."""
    return PLAYBOOK


@mcp.resource("reliefos://emergencies/{emergency_id}", name="emergency", title="Emergency record", mime_type="application/json")
async def emergency(emergency_id: str) -> str:
    """An emergency with its NGO requests."""
    return await _get(f"/emergencies/{emergency_id}")


@mcp.resource("reliefos://plans/{plan_id}", name="plan", title="Procurement plan", mime_type="application/json")
async def plan(plan_id: str) -> str:
    """A procurement plan with purchases, allocations, approvals, payments and revisions."""
    return await _get(f"/procurement/plans/{plan_id}")


@mcp.resource("reliefos://suppliers/catalog", name="supplier-catalog", title="Supplier catalog", mime_type="application/json")
async def supplier_catalog() -> str:
    """All stored vendor offers (price, capacity, lead time, availability, validity)."""
    return await _get("/vendor-offers")


@mcp.resource("reliefos://workflows/{workflow_id}", name="workflow", title="Agent workflow trace", mime_type="application/json")
async def workflow(workflow_id: str) -> str:
    """A persisted agent workflow and its ordered steps."""
    return await _get(f"/agent-workflows/{workflow_id}")
