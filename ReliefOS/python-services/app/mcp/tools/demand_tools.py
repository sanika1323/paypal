from typing import Any

from ..server import reliefos_tool
from .common import EmergencyId


@reliefos_tool("read", "demand", "Consolidate emergency demand")
async def consolidate_emergency_demand(emergency_id: EmergencyId, api: Any) -> dict:
    """Group eligible NGO requests by product; keeps every source request id, urgency and NGO, and flags
    duplicate or conflicting requests. Original requests are never modified."""
    return await api.post("/agents/demand", {"emergencyId": emergency_id})
