from typing import Annotated, Any, Optional

from pydantic import Field

from ..server import reliefos_tool


@reliefos_tool("read", "audit", "Get procurement audit history")
async def get_procurement_audit_history(
    entity_id: Annotated[Optional[str], Field(description="Filter by entity id (plan, proposal, delivery, payment)")] = None,
    action_prefix: Annotated[Optional[str], Field(description="Filter by action prefix, e.g. REPLANNING_")] = None,
    limit: Annotated[int, Field(ge=1, le=500)] = 100,
    api: Any = None,
) -> dict:
    """Server-written audit events, newest first."""
    return {"events": await api.get("/audit-logs", entityId=entity_id, action=action_prefix, limit=limit)}


@reliefos_tool("read", "audit", "Get agent execution trace")
async def get_agent_execution_trace(workflow_id: str, api: Any) -> dict:
    """A workflow's state, checkpoint and every recorded step (agent, kind, tool, status, duration, errors)."""
    return await api.get(f"/agent-workflows/{workflow_id}")


@reliefos_tool("read", "audit", "Get supplier risk metrics")
async def get_supplier_risk_metrics(api: Any) -> dict:
    """Per vendor: usable offers, capacity, real vs simulated failures, on-time deliveries and documented risk score."""
    return {"vendors": await api.get("/analytics/suppliers")}


@reliefos_tool("read", "audit", "Get procurement analytics")
async def get_procurement_analytics(api: Any) -> dict:
    """Aggregates from persisted records: plans by status, committed spend, captured payments, deliveries, proposals."""
    return await api.get("/analytics/procurement")
