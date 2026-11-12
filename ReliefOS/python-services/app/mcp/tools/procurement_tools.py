from typing import Annotated, Any

from pydantic import Field

from ..server import derive_idempotency_key, reliefos_tool
from .common import Budget, EmergencyId, MaxDays, PlanId, WorkflowId


@reliefos_tool("read", "procurement", "Run deterministic procurement optimization (preview)")
async def run_procurement_optimization(emergency_id: EmergencyId, budget: Budget, max_delivery_days: MaxDays = None, api: Any = None) -> dict:
    """The TypeScript optimizer's preview: purchases, NGO allocation, cost, coverage, excluded offers and an input
    fingerprint. Authoritative for every number. Saves nothing."""
    return await api.post("/procurement/optimize", {"emergencyId": emergency_id, "budget": budget, "maxDeliveryDays": max_delivery_days})


@reliefos_tool("write", "procurement", "Create procurement plan (DRAFT)")
async def create_procurement_plan(emergency_id: EmergencyId, budget: Budget, max_delivery_days: MaxDays = None,
                                  workflow_id: WorkflowId = None, api: Any = None) -> dict:
    """Persist the optimizer result as a DRAFT plan. The server recomputes and refuses infeasible plans."""
    args = {"emergencyId": emergency_id, "budget": budget, "maxDeliveryDays": max_delivery_days}
    plan = await api.post("/procurement/plans", args, idempotency_key=derive_idempotency_key("create_procurement_plan", workflow_id, args))
    return {"planId": plan["id"], "name": plan["name"], "status": plan["status"], "version": plan.get("version"),
            "totalBudget": plan["totalBudget"], "totalCost": plan["totalCost"], "items": len(plan.get("items", []))}


@reliefos_tool("read", "procurement", "Get procurement plan")
async def get_procurement_plan(plan_id: PlanId, api: Any) -> dict:
    """A plan with version, items, purchases, NGO allocations, approvals, payments and revision links."""
    return await api.get(f"/procurement/plans/{plan_id}")


def _plan_lines(plan: dict) -> list[dict]:
    return [
        {"productName": i["product"]["name"], "vendorName": p["vendorOffer"]["vendor"]["name"], "quantity": p["quantity"],
         "unitPrice": p["unitPrice"], "lineTotal": p["totalAmount"], "deliveryDays": p["deliveryDays"]}
        for i in plan["items"] for p in i["purchases"]
    ]


@reliefos_tool("read", "procurement", "Compare two procurement plans")
async def compare_procurement_plans(
    plan_a: Annotated[str, Field(description="First (e.g. original) plan id")],
    plan_b: Annotated[str, Field(description="Second (e.g. revised) plan id")],
    api: Any = None,
) -> dict:
    """Side-by-side cost, suppliers, quantities and delivery time of two persisted plans."""
    a, b = await api.get(f"/procurement/plans/{plan_a}"), await api.get(f"/procurement/plans/{plan_b}")
    la, lb = _plan_lines(a), _plan_lines(b)
    va, vb = {l["vendorName"] for l in la}, {l["vendorName"] for l in lb}
    return {
        "planA": {"id": a["id"], "status": a["status"], "totalCost": a["totalCost"], "lines": la},
        "planB": {"id": b["id"], "status": b["status"], "totalCost": b["totalCost"], "lines": lb},
        "costDelta": f"{float(b['totalCost']) - float(a['totalCost']):.2f}",
        "suppliersAdded": sorted(vb - va), "suppliersRemoved": sorted(va - vb),
        "maxDeliveryDays": {"planA": max((l["deliveryDays"] for l in la), default=None), "planB": max((l["deliveryDays"] for l in lb), default=None)},
    }
