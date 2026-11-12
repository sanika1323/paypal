from typing import Any

from ..server import reliefos_tool
from .common import EmergencyId, PlanId


@reliefos_tool("read", "fulfilment", "Get fulfilment status")
async def get_fulfilment_status(emergency_id: EmergencyId, api: Any) -> dict:
    """Per plan: allocated, purchased, dispatched, delivered, delayed and failed quantities, blockers and next action,
    all from persisted records."""
    return await api.post("/agents/fulfilment", {"emergencyId": emergency_id})


@reliefos_tool("read", "fulfilment", "Get purchase records")
async def get_purchase_records(plan_id: PlanId, api: Any) -> dict:
    """The plan's supplier purchase lines (supplier, product, quantity, unit price, total, lead time)."""
    plan = await api.get(f"/procurement/plans/{plan_id}")
    return {"planId": plan_id, "purchases": [
        {"purchaseId": p["id"], "productName": i["product"]["name"], "vendorName": p["vendorOffer"]["vendor"]["name"],
         "quantity": p["quantity"], "unit": i["unit"], "unitPrice": p["unitPrice"], "totalAmount": p["totalAmount"], "deliveryDays": p["deliveryDays"]}
        for i in plan["items"] for p in i["purchases"]]}


@reliefos_tool("read", "fulfilment", "Get delivery records")
async def get_delivery_records(plan_id: PlanId, api: Any) -> dict:
    """Every supplier → NGO shipment of a plan: status, dispatched and delivered quantity, ETA, receipt, delay/failure reason."""
    rows = await api.get("/deliveries", planId=plan_id)
    deliveries = [{
        "deliveryId": d["id"], "trackingRef": d.get("trackingRef"), "status": d["status"], "destination": d["destination"],
        "quantity": d["quantity"], "dispatchedQuantity": d.get("dispatchedQuantity", 0), "deliveredQuantity": d.get("deliveredQuantity", 0),
        "supplier": ((d.get("procurementPurchase") or {}).get("vendorOffer") or {}).get("vendor", {}).get("name"),
        "estimatedAt": d.get("estimatedAt"), "receivedBy": d.get("receivedBy"), "receivedAt": d.get("receivedAt"),
        "delayReason": d.get("delayReason"), "failureReason": d.get("failureReason"),
    } for d in rows]
    return {"planId": plan_id, "deliveries": deliveries, "summary": {
        "total": len(deliveries),
        "delivered": sum(d["status"] == "DELIVERED" for d in deliveries),
        "failed": sum(d["status"] == "FAILED" for d in deliveries),
        "active": sum(d["status"] in ("PENDING", "DISPATCHED", "IN_TRANSIT", "DELAYED") for d in deliveries),
    }}
