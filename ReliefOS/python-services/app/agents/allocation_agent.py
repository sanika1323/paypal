from typing import Any, Optional

from .base import BaseAgent


class AllocationAgent(BaseAgent):
    """Runs the deterministic optimizer and, when asked, persists a DRAFT plan and submits it for human
    approval. It cannot approve, reject or pay."""
    name = "ALLOCATION_AGENT"
    allowed_tools = frozenset({"run_procurement_optimization", "create_procurement_plan", "submit_plan_for_approval", "get_procurement_plan"})

    async def preview(self, emergency_id: str, budget: float, max_delivery_days: Optional[int]) -> dict[str, Any]:
        r = await self.call("run_procurement_optimization", emergency_id=emergency_id, budget=budget, max_delivery_days=max_delivery_days)
        return {
            "feasible": r["feasible"], "estimatedCost": r["estimatedCost"], "remainingBudget": r["remainingBudget"],
            "budgetFeasible": r["budgetFeasible"], "fulfillment": r["fulfillment"], "inputFingerprint": r["inputFingerprint"],
            "purchases": [{"vendorName": p.get("vendorName"), "productName": p.get("productName"), "quantity": p["quantity"],
                           "unitPrice": p["unitPrice"], "totalAmount": p.get("totalAmount")} for p in r["supplierPurchases"]],
            "ngoAllocations": len(r["ngoAllocations"]), "excludedOffers": r.get("excludedOffers", []),
        }

    async def create_draft(self, emergency_id: str, budget: float, max_delivery_days: Optional[int]) -> dict[str, Any]:
        return await self.call("create_procurement_plan", emergency_id=emergency_id, budget=budget,
                               max_delivery_days=max_delivery_days, workflow_id=self.workflow_id)

    async def submit(self, plan_id: str) -> dict[str, Any]:
        return await self.call("submit_plan_for_approval", plan_id=plan_id)
