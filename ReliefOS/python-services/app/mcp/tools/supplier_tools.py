from typing import Annotated, Any, Optional

from pydantic import Field

from ..server import reliefos_tool
from .common import EmergencyId


@reliefos_tool("read", "supplier", "List available vendors with risk metrics")
async def list_available_vendors(api: Any) -> dict:
    """Vendors with usable offers, capacity, reliability (or unrated), real failure history and a documented risk score."""
    rows = await api.get("/analytics/suppliers")
    return {"vendors": rows}


@reliefos_tool("read", "supplier", "Get vendor offers")
async def get_vendor_offers(
    product_id: Annotated[Optional[str], Field(description="Filter by product id")] = None,
    vendor_id: Annotated[Optional[str], Field(description="Filter by vendor id")] = None,
    api: Any = None,
) -> dict:
    """Stored vendor offers: unit price, capacity, delivery days, availability and validity."""
    rows = await api.get("/vendor-offers", productId=product_id, vendorId=vendor_id)
    return {
        "offers": [
            {
                "offerId": o["id"], "vendorId": o["vendorId"], "vendorName": o["vendor"]["name"], "productId": o["productId"],
                "productName": o["product"]["name"], "unitPrice": o["unitPrice"], "capacity": o["capacity"],
                "deliveryDays": o["deliveryDays"], "isAvailable": o.get("isAvailable", True), "validUntil": o.get("validUntil"),
            }
            for o in rows
        ]
    }


@reliefos_tool("read", "supplier", "Compare supplier offers")
async def compare_supplier_offers(emergency_id: EmergencyId, api: Any) -> dict:
    """Rank usable offers per demanded product (price → delivery → reliability) with risk, and list unusable offers."""
    return await api.post("/agents/suppliers", {"emergencyId": emergency_id})


@reliefos_tool("read", "supplier", "Evaluate supplier capacity")
async def evaluate_supplier_capacity(emergency_id: EmergencyId, api: Any) -> dict:
    """Per product: required quantity vs total usable capacity, and whether any single supplier can cover it."""
    data = await api.post("/agents/suppliers", {"emergencyId": emergency_id})
    return {
        "emergencyId": emergency_id,
        "products": [
            {
                "productName": p["productName"], "unit": p["unit"], "requiredQuantity": p["requiredQuantity"],
                "totalAvailableCapacity": p["totalAvailableCapacity"], "aggregateCapacitySufficient": p["aggregateCapacitySufficient"],
                "singleSupplierCanCover": any(o["capacitySufficient"] for o in p["offers"]),
                "shortfall": max(0, p["requiredQuantity"] - p["totalAvailableCapacity"]),
            }
            for p in data["products"]
        ],
        "unusableOffers": data.get("unusableOffers", []),
    }
