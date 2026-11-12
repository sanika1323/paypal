from typing import Annotated, Any, Optional

from pydantic import Field

from ..server import reliefos_tool
from .common import EmergencyId


@reliefos_tool("read", "emergency", "List active emergencies")
async def list_active_emergencies(api: Any) -> dict:
    """Active emergencies with severity, location, coordinates (if recorded) and request/plan counts."""
    items = await api.get("/emergencies")
    return {"emergencies": [e for e in items if e.get("isActive")]}


@reliefos_tool("read", "emergency", "Get emergency details")
async def get_emergency_details(emergency_id: EmergencyId, api: Any) -> dict:
    """One emergency with its relief requests (NGO, product, quantity, urgency, status) and plans."""
    return await api.get(f"/emergencies/{emergency_id}")


@reliefos_tool("read", "emergency", "List relief requests")
async def list_relief_requests(
    emergency_id: EmergencyId,
    status: Annotated[Optional[str], Field(description="Filter: PENDING, VERIFIED, CONSOLIDATED, APPROVED, FULFILLED, REJECTED")] = None,
    api: Any = None,
) -> dict:
    """Original NGO relief requests for an emergency, unmodified."""
    rows = await api.get("/relief-requests", emergencyId=emergency_id, status=status)
    return {
        "emergencyId": emergency_id,
        "requests": [
            {
                "requestId": r["id"], "organizationId": r["organizationId"], "organizationName": r["organization"]["name"],
                "productId": r["productId"], "productName": r["product"]["name"], "unit": r["product"]["unit"],
                "quantity": r["quantity"], "urgency": r["urgency"], "status": r["status"], "notes": r.get("notes"),
                "createdAt": r["createdAt"],
            }
            for r in rows
        ],
    }
