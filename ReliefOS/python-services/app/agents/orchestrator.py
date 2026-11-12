"""Orchestrator: routes a workflow through the specialist agents, owns the human-approval interrupt,
and is the only agent allowed to hand a validated proposal to humans. It cannot approve anything."""
from typing import Any, Optional

from .base import BaseAgent


class OrchestratorAgent(BaseAgent):
    name = "ORCHESTRATOR"
    allowed_tools = frozenset({"request_human_approval", "get_approval_status", "get_replanning_history", "get_procurement_plan"})

    async def plan_status(self, plan_id: str) -> dict[str, Any]:
        return await self.call("get_approval_status", plan_id=plan_id)

    async def plan(self, plan_id: str) -> dict[str, Any]:
        return await self.call("get_procurement_plan", plan_id=plan_id)

    async def proposal_status(self, plan_id: str, proposal_id: str) -> Optional[dict[str, Any]]:
        history = await self.call("get_replanning_history", plan_id=plan_id)
        return next((p for p in history["proposals"] if p["id"] == proposal_id), None)

    async def hand_to_humans(self, proposal_id: str) -> dict[str, Any]:
        return await self.call("request_human_approval", proposal_id=proposal_id, submitted_by="agent:orchestrator")
