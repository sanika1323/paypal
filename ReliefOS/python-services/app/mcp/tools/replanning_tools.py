from typing import Annotated, Any, Literal, Optional

from pydantic import BaseModel, Field

from ..server import derive_idempotency_key, reliefos_tool
from .common import EmergencyId, MaxDays, PlanId, WorkflowId

FailureType = Literal[
    "ORDER_CANCELLED", "INSUFFICIENT_STOCK", "CAPACITY_REDUCED", "SUPPLIER_UNAVAILABLE",
    "OFFER_EXPIRED", "PRICE_CHANGED", "DELIVERY_DELAYED", "WHAT_IF_SCENARIO",
]


class OfferOverride(BaseModel):
    capacity: Optional[int] = Field(default=None, ge=0)
    unitPrice: Optional[str] = None
    deliveryDays: Optional[int] = Field(default=None, gt=0)
    isAvailable: Optional[bool] = None


@reliefos_tool("write", "replanning", "Report a SIMULATED supplier failure")
async def report_supplier_failure(
    failure_type: FailureType,
    vendor_id: str,
    reason: Annotated[str, Field(min_length=3)],
    vendor_offer_id: Optional[str] = None,
    plan_id: Optional[str] = None,
    reported_capacity: Annotated[Optional[int], Field(ge=0)] = None,
    reported_unit_price: Optional[str] = None,
    reported_delivery_days: Annotated[Optional[int], Field(gt=0)] = None,
    workflow_id: WorkflowId = None,
    api: Any = None,
) -> dict:
    """Record a what-if supplier failure, always labelled as a SIMULATION. It changes no stored offer, plan or
    delivery. Real failures must be reported by a human coordinator in the UI."""
    body = {
        "type": failure_type, "vendorId": vendor_id, "vendorOfferId": vendor_offer_id, "planId": plan_id,
        "reportedCapacity": reported_capacity, "reportedUnitPrice": reported_unit_price,
        "reportedDeliveryDays": reported_delivery_days, "reason": reason, "isSimulation": True, "reportedBy": "agent:replanning",
    }
    result = await api.post("/supplier-failures", body, idempotency_key=derive_idempotency_key("report_supplier_failure", workflow_id, body))
    return {"event": result["event"], "isSimulation": True}


@reliefos_tool("read", "replanning", "Get allocations affected by a supplier failure")
async def get_affected_allocations(failure_event_id: str, api: Any) -> dict:
    """Plans, purchases, NGO allocations and deliveries touched by a failure, with suggested mode
    (REPLACEMENT for unpaid plans, AMENDMENT for paid plans)."""
    return await api.get(f"/supplier-failures/{failure_event_id}/affected")


@reliefos_tool("read", "replanning", "Find alternative suppliers")
async def find_alternative_suppliers(
    emergency_id: EmergencyId,
    exclude_vendor_id: Annotated[str, Field(description="The failed supplier to exclude")],
    api: Any = None,
) -> dict:
    """Usable offers from OTHER suppliers for the emergency's demanded products, ranked as the optimizer would."""
    data = await api.post("/agents/suppliers", {"emergencyId": emergency_id})
    return {
        "excludedVendorId": exclude_vendor_id,
        "products": [
            {
                "productName": p["productName"], "requiredQuantity": p["requiredQuantity"],
                "alternatives": [o for o in p["offers"] if o["vendorId"] != exclude_vendor_id],
                "alternativeCapacity": sum(o["capacity"] for o in p["offers"] if o["vendorId"] != exclude_vendor_id),
            }
            for p in data["products"]
        ],
    }


@reliefos_tool("write", "replanning", "Generate a replanning proposal")
async def generate_replanning_proposal(
    source_plan_id: PlanId,
    failure_event_id: Optional[str] = None,
    budget: Annotated[Optional[float], Field(gt=0)] = None,
    max_delivery_days: MaxDays = None,
    exclude_offer_ids: Optional[list[str]] = None,
    offer_overrides: Optional[dict[str, OfferOverride]] = None,
    rationale: Optional[str] = None,
    workflow_id: WorkflowId = None,
    api: Any = None,
) -> dict:
    """The deterministic optimizer computes a revised candidate (REPLACEMENT for unpaid plans; AMENDMENT covering
    only failed/short-delivered quantity for paid plans) and the backend stores it as a versioned DRAFT
    proposal with an original-vs-revised comparison. Overrides make it a simulation. Never commits anything."""
    scenario = None
    if exclude_offer_ids or offer_overrides:
        scenario = {"excludeOfferIds": exclude_offer_ids or [],
                    "offerOverrides": {k: v.model_dump(exclude_none=True) for k, v in (offer_overrides or {}).items()}}
    body = {
        "sourcePlanId": source_plan_id, "failureEventId": failure_event_id, "budget": budget, "maxDeliveryDays": max_delivery_days,
        "scenario": scenario, "rationale": rationale, "createdBy": "agent:replanning", "workflowId": workflow_id,
    }
    result = await api.post("/replanning/proposals", body, idempotency_key=derive_idempotency_key("generate_replanning_proposal", workflow_id, body))
    p = result["proposal"]
    return {
        "proposalId": p["id"], "mode": p["mode"], "status": p["status"], "isSimulation": p["isSimulation"],
        "sourcePlanId": p["sourcePlanId"], "sourcePlanVersion": p["sourcePlanVersion"],
        "feasible": p["candidate"]["feasible"], "revisedCost": p["candidate"]["estimatedCost"],
        "fulfillment": p["candidate"]["fulfillment"], "comparison": p["comparison"], "replayed": result.get("replayed", False),
    }


@reliefos_tool("read", "replanning", "Get replanning history")
async def get_replanning_history(plan_id: PlanId, api: Any) -> dict:
    """Failure events and replanning proposals (with every validation report) for a plan."""
    failures = await api.get("/supplier-failures", planId=plan_id)
    proposals = await api.get("/replanning/proposals", sourcePlanId=plan_id)
    return {"planId": plan_id, "failures": failures, "proposals": proposals}
