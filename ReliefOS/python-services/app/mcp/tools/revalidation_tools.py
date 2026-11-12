from typing import Any, Literal, Optional

from pydantic import BaseModel

from ..server import reliefos_tool
from .common import ProposalId

Outcome = Literal["VALIDATED", "VALIDATED_WITH_WARNINGS", "REJECTED_INFEASIBLE", "REJECTED_STALE_DATA", "REJECTED_VERSION_CONFLICT", "REQUIRES_HUMAN_REVIEW"]


class AgentCheck(BaseModel):
    code: str
    status: Literal["PASS", "WARN", "FAIL"]
    message: str


@reliefos_tool("read", "revalidation", "Fetch fresh procurement inputs for a proposal")
async def fetch_fresh_procurement_inputs(proposal_id: ProposalId, api: Any) -> dict:
    """Fresh source plan (with version), the proposal as stored, and current stored offers for every
    supplier the proposal buys from."""
    proposal = await api.get(f"/replanning/proposals/{proposal_id}")
    plan = await api.get(f"/procurement/plans/{proposal['sourcePlanId']}")
    offers = {}
    for purchase in proposal["candidate"]["supplierPurchases"]:
        rows = await api.get("/vendor-offers", vendorId=purchase["vendorId"], productId=purchase["productId"])
        for o in rows:
            offers[o["id"]] = {"offerId": o["id"], "unitPrice": o["unitPrice"], "capacity": o["capacity"], "deliveryDays": o["deliveryDays"],
                               "isAvailable": o.get("isAvailable", True), "validUntil": o.get("validUntil")}
    return {"proposal": proposal, "plan": {"id": plan["id"], "status": plan["status"], "version": plan.get("version"),
            "payments": [{"status": p["status"]} for p in plan.get("payments", [])]}, "currentOffers": offers}


@reliefos_tool("read", "revalidation", "Validate plan version")
async def validate_plan_version(proposal_id: ProposalId, api: Any) -> dict:
    """Compares the proposal's source plan version with the plan's current version (optimistic concurrency)."""
    proposal = await api.get(f"/replanning/proposals/{proposal_id}")
    plan = await api.get(f"/procurement/plans/{proposal['sourcePlanId']}")
    same = plan.get("version") == proposal["sourcePlanVersion"]
    return {"status": "PASS" if same else "FAIL", "expectedVersion": proposal["sourcePlanVersion"], "currentVersion": plan.get("version"),
            "planStatus": plan["status"]}


@reliefos_tool("read", "revalidation", "Validate supplier availability")
async def validate_supplier_availability(proposal_id: ProposalId, api: Any) -> dict:
    """For every proposed purchase: is the offer still available, unexpired, at the same price, with enough capacity?"""
    proposal = await api.get(f"/replanning/proposals/{proposal_id}")
    overrides = proposal["scenario"].get("offerOverrides", {})
    checks = []
    for p in proposal["candidate"]["supplierPurchases"]:
        rows = await api.get("/vendor-offers", vendorId=p["vendorId"], productId=p["productId"])
        o = next((r for r in rows if r["id"] == p["offerId"]), None)
        label = f"{p['vendorName']} · {p['productName']}"
        if o is None:
            checks.append({"code": "OFFER_EXISTS", "status": "FAIL", "message": f"{label}: offer missing"})
            continue
        ov = overrides.get(p["offerId"], {})
        capacity, price = ov.get("capacity", o["capacity"]), float(ov.get("unitPrice", o["unitPrice"]))
        available = ov.get("isAvailable", o.get("isAvailable", True))
        checks.append({"code": "AVAILABLE", "status": "PASS" if available else "FAIL", "message": f"{label}: {'available' if available else 'unavailable'}"})
        checks.append({"code": "CAPACITY", "status": "PASS" if capacity >= p["quantity"] else "FAIL", "message": f"{label}: capacity {capacity} for {p['quantity']}"})
        checks.append({"code": "PRICE", "status": "PASS" if abs(price - float(p["unitPrice"])) < 0.005 else "FAIL",
                       "message": f"{label}: proposed {p['unitPrice']}, now {price:.2f}"})
    return {"proposalId": proposal_id, "checks": checks, "allPass": all(c["status"] == "PASS" for c in checks)}


@reliefos_tool("read", "revalidation", "Validate budget and capacity")
async def validate_budget_and_capacity(proposal_id: ProposalId, api: Any) -> dict:
    """Checks the candidate's cost against its budget and that every affected unit is purchased and allocated."""
    proposal = await api.get(f"/replanning/proposals/{proposal_id}")
    c = proposal["candidate"]
    demand = sum(d["quantity"] for d in proposal["scenario"]["demand"])
    purchased = sum(p["quantity"] for p in c["supplierPurchases"])
    allocated = sum(a["allocatedQuantity"] for a in c["ngoAllocations"])
    return {
        "budget": proposal["budget"], "cost": c["estimatedCost"],
        "checks": [
            {"code": "BUDGET", "status": "PASS" if float(c["estimatedCost"]) <= float(proposal["budget"]) else "FAIL",
             "message": f"cost {c['estimatedCost']} vs budget {proposal['budget']}"},
            {"code": "QUANTITY", "status": "PASS" if purchased == demand == allocated else "FAIL",
             "message": f"demand {demand}, purchased {purchased}, allocated {allocated}"},
            {"code": "FEASIBLE", "status": "PASS" if c["feasible"] else "FAIL", "message": f"optimizer feasible={c['feasible']}"},
        ],
    }


@reliefos_tool("write", "revalidation", "Submit independent validation of a revised plan")
async def validate_revised_plan(proposal_id: ProposalId, agent_outcome: Outcome, agent_checks: list[AgentCheck],
                                workflow_id: Optional[str] = None, api: Any = None) -> dict:
    """Submit the Revalidation Agent's own findings. The backend independently re-runs the optimizer on fresh data;
    its rejections always stand, and a disagreement with a passing result escalates to REQUIRES_HUMAN_REVIEW."""
    result = await api.post(f"/replanning/proposals/{proposal_id}/validations", {
        "validator": "agent:revalidation", "workflowId": workflow_id, "agentOutcome": agent_outcome,
        "agentChecks": [c.model_dump() for c in agent_checks],
    })
    return {"reportId": result["report"]["id"], "outcome": result["outcome"], "serverOutcome": result["serverOutcome"],
            "serverChecks": result["report"]["checks"]["server"]}


@reliefos_tool("read", "revalidation", "Compare original and revised plan")
async def compare_original_and_revised_plan(proposal_id: ProposalId, api: Any) -> dict:
    """The stored original-vs-revised comparison: cost delta, coverage, suppliers added/removed, delivery time, lines."""
    proposal = await api.get(f"/replanning/proposals/{proposal_id}")
    return {"proposalId": proposal_id, "mode": proposal["mode"], "isSimulation": proposal["isSimulation"], "comparison": proposal["comparison"],
            "latestValidation": (proposal.get("validations") or [None])[0]}
