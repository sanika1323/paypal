from typing import Any

from .base import BaseAgent


class FulfilmentAgent(BaseAgent):
    """Reads purchase, payment and delivery records. Read-only: it cannot change delivery status or confirm receipt."""
    name = "FULFILMENT_AGENT"
    allowed_tools = frozenset({"get_fulfilment_status", "get_delivery_records", "get_purchase_records"})

    async def run(self, emergency_id: str) -> dict[str, Any]:
        status = await self.call("get_fulfilment_status", emergency_id=emergency_id)
        return {"summary": status.get("summary"), "plans": [
            {"planId": p.get("planId"), "status": p.get("planStatus"), "nextAction": p.get("nextAction"),
             "quantities": p.get("quantities"), "blockers": p.get("blockers", [])}
            for p in status.get("plans", [])]}
