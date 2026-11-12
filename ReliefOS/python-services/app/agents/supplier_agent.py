from typing import Any

from .base import BaseAgent


class SupplierAgent(BaseAgent):
    """Compares stored supplier offers and capacity. It never invents availability."""
    name = "SUPPLIER_AGENT"
    allowed_tools = frozenset({"compare_supplier_offers", "evaluate_supplier_capacity", "list_available_vendors", "get_vendor_offers"})

    async def run(self, emergency_id: str) -> dict[str, Any]:
        capacity = await self.call("evaluate_supplier_capacity", emergency_id=emergency_id)
        shortfalls = [p for p in capacity["products"] if p["shortfall"] > 0]
        return {
            "products": capacity["products"],
            "unusableOffers": capacity.get("unusableOffers", []),
            "capacityShortfalls": shortfalls,
        }
