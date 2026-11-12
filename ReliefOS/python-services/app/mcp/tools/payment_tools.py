from typing import Annotated, Any

from pydantic import Field

from ..server import reliefos_tool
from .common import PlanId

PaymentId = Annotated[str, Field(description="ReliefOS payment id")]


@reliefos_tool("read", "payment", "Prepare PayPal checkout (readiness check only)")
async def prepare_paypal_checkout(plan_id: PlanId, api: Any) -> dict:
    """Reports whether a plan can be paid and its INR amount. It does NOT create a PayPal order: a human
    coordinator starts Sandbox checkout in the UI. Agents can never capture payments."""
    plan = await api.get(f"/procurement/plans/{plan_id}")
    active = [p for p in plan.get("payments", []) if p["status"] in ("PENDING", "APPROVED", "PROCESSING", "COMPLETED")]
    approved = plan["status"] == "APPROVED" and any(a["approved"] for a in plan.get("approvals", []))
    return {
        "planId": plan["id"], "status": plan["status"], "amountINR": plan["totalCost"],
        "readyForCheckout": approved and not active,
        "blockers": ([] if approved else ["Plan is not approved by a human."]) + (["An active or completed payment already exists."] if active else []),
        "checkoutIsHumanOnly": True,
    }


@reliefos_tool("read", "payment", "Get payment status")
async def get_payment_status(payment_id: PaymentId, api: Any) -> dict:
    """Stored payment: INR amount, USD amount, exchange rate + provider + date, PayPal order and capture ids, status."""
    return await api.get(f"/payments/{payment_id}")


@reliefos_tool("read", "payment", "Verify PayPal payment with PayPal")
async def verify_paypal_payment(payment_id: PaymentId, api: Any) -> dict:
    """Asks PayPal Sandbox for the order's current state and checks it matches the stored payment. Read-only."""
    return await api.get(f"/payments/{payment_id}/verify-paypal-order")
