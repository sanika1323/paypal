from typing import Any

from .base import BaseAgent


class RevalidationAgent(BaseAgent):
    """Independent check of a proposal against FRESH data. It does not reuse the Replanning Agent's
    reasoning, and its verdict is cross-checked by the server, whose rejection always stands."""
    name = "REVALIDATION_AGENT"
    allowed_tools = frozenset({"fetch_fresh_procurement_inputs", "validate_plan_version", "validate_supplier_availability",
                               "validate_budget_and_capacity", "validate_revised_plan", "compare_original_and_revised_plan"})

    @staticmethod
    def outcome_from(version: dict, suppliers: dict, budget: dict, comparison: dict) -> tuple[str, list[dict]]:
        checks = [{"code": "PLAN_VERSION", "status": version["status"],
                   "message": f"expected v{version['expectedVersion']}, current v{version['currentVersion']} ({version['planStatus']})"}]
        checks += suppliers["checks"] + budget["checks"]
        cost_delta = float((comparison.get("comparison") or {}).get("costDelta") or 0)
        if cost_delta > 0:
            checks.append({"code": "COST_INCREASE", "status": "WARN", "message": f"revised plan costs {cost_delta:.2f} more"})
        if comparison.get("isSimulation"):
            checks.append({"code": "SIMULATION", "status": "WARN", "message": "simulation - cannot be submitted"})
        failed = {c["code"] for c in checks if c["status"] == "FAIL"}
        if "PLAN_VERSION" in failed:
            return "REJECTED_VERSION_CONFLICT", checks
        if failed & {"OFFER_EXISTS", "AVAILABLE", "CAPACITY", "PRICE"}:
            return "REJECTED_STALE_DATA", checks
        if failed:
            return "REJECTED_INFEASIBLE", checks
        if any(c["status"] == "WARN" for c in checks):
            return "VALIDATED_WITH_WARNINGS", checks
        return "VALIDATED", checks

    async def run(self, proposal_id: str) -> dict[str, Any]:
        version = await self.call("validate_plan_version", proposal_id=proposal_id)
        suppliers = await self.call("validate_supplier_availability", proposal_id=proposal_id)
        budget = await self.call("validate_budget_and_capacity", proposal_id=proposal_id)
        comparison = await self.call("compare_original_and_revised_plan", proposal_id=proposal_id)
        agent_outcome, checks = await self.decide(
            "derive_validation_outcome", {"proposalId": proposal_id},
            lambda: self.outcome_from(version, suppliers, budget, comparison))
        report = await self.call("validate_revised_plan", proposal_id=proposal_id, agent_outcome=agent_outcome,
                                 agent_checks=checks, workflow_id=self.workflow_id)
        return {"agentOutcome": agent_outcome, "outcome": report["outcome"], "serverOutcome": report["serverOutcome"],
                "reportId": report["reportId"], "checks": checks, "comparison": comparison["comparison"]}
