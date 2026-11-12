from typing import Any

from ..server import reliefos_tool
from .common import PlanId, ProposalId


@reliefos_tool("write", "approval", "Submit plan for human approval")
async def submit_plan_for_approval(plan_id: PlanId, api: Any) -> dict:
    """DRAFT → PENDING_APPROVAL. Only a signed-in human coordinator can approve or reject."""
    plan = await api.post(f"/procurement/plans/{plan_id}/submit")
    return {"planId": plan["id"], "status": plan["status"], "nextStep": "A human coordinator reviews it in ReliefOS > Approvals."}


@reliefos_tool("read", "approval", "Get approval status")
async def get_approval_status(plan_id: PlanId, api: Any) -> dict:
    """Plan status, version and every recorded approval decision."""
    plan = await api.get(f"/procurement/plans/{plan_id}")
    return {
        "planId": plan["id"], "status": plan["status"], "version": plan.get("version"),
        "approvals": [{"approved": a["approved"], "approvedBy": a["approvedBy"], "comments": a.get("comments"), "createdAt": a["createdAt"]}
                      for a in plan.get("approvals", [])],
        "awaitingHuman": plan["status"] == "PENDING_APPROVAL",
    }


@reliefos_tool("write", "approval", "Request human approval for a validated proposal")
async def request_human_approval(proposal_id: ProposalId, submitted_by: str, api: Any = None) -> dict:
    """Move a validated (non-simulation) replanning proposal to PENDING_APPROVAL. Refused for rejected proposals."""
    p = await api.post(f"/replanning/proposals/{proposal_id}/submit", {"submittedBy": submitted_by})
    return {"proposalId": p["id"], "status": p["status"]}
