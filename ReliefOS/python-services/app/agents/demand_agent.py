from typing import Any

from .base import BaseAgent


class DemandAgent(BaseAgent):
    """Consolidates NGO requests for an emergency. Original requests are never modified."""
    name = "DEMAND_AGENT"
    allowed_tools = frozenset({"consolidate_emergency_demand", "list_relief_requests", "get_emergency_details"})

    async def run(self, emergency_id: str) -> dict[str, Any]:
        demand = await self.call("consolidate_emergency_demand", emergency_id=emergency_id)
        products = demand.get("products", [])
        return {
            "products": [{"productId": p["productId"], "productName": p["productName"], "totalQuantity": p["totalQuantity"],
                          "requests": len(p.get("organizations", [])), "maxUrgency": p.get("maxUrgency")} for p in products],
            "totalUnits": sum(p["totalQuantity"] for p in products),
            "issues": demand.get("issues", []),
        }
