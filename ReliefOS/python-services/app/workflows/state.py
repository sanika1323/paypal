"""Typed workflow requests and the persisted workflow state."""
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, model_validator

FailureType = Literal["ORDER_CANCELLED", "INSUFFICIENT_STOCK", "CAPACITY_REDUCED", "SUPPLIER_UNAVAILABLE",
                      "OFFER_EXPIRED", "PRICE_CHANGED", "DELIVERY_DELAYED", "WHAT_IF_SCENARIO"]


class ProcurementRequest(BaseModel):
    emergency_id: str = Field(min_length=1)
    budget: float = Field(gt=0)
    max_delivery_days: Optional[int] = Field(default=None, gt=0)
    persist: bool = True
    submit_for_approval: bool = True
    explain: bool = True
    trigger: str = "coordinator"


class SimulatedFailure(BaseModel):
    failure_type: FailureType
    vendor_id: str = Field(min_length=1)
    vendor_offer_id: Optional[str] = None
    reason: str = Field(min_length=3)
    reported_capacity: Optional[int] = Field(default=None, ge=0)
    reported_unit_price: Optional[str] = None
    reported_delivery_days: Optional[int] = Field(default=None, gt=0)


class ReplanningRequest(BaseModel):
    plan_id: str = Field(min_length=1)
    failure_event_id: Optional[str] = None
    simulation: Optional[SimulatedFailure] = None
    budget: Optional[float] = Field(default=None, gt=0)
    max_delivery_days: Optional[int] = Field(default=None, gt=0)
    submit_for_approval: bool = True
    max_attempts: int = Field(default=2, ge=1, le=3)
    explain: bool = True
    trigger: str = "coordinator"

    @model_validator(mode="after")
    def _one_source(self) -> "ReplanningRequest":
        if bool(self.failure_event_id) == bool(self.simulation):
            raise ValueError("Provide exactly one of failure_event_id (a reported failure) or simulation (a what-if).")
        return self


Status = Literal["RUNNING", "WAITING_FOR_HUMAN", "COMPLETED", "FAILED"]


class WorkflowState(BaseModel):
    workflow_id: Optional[str] = None
    type: Literal["PROCUREMENT", "REPLANNING"]
    status: Status = "RUNNING"
    checkpoint: str = "started"
    is_simulation: bool = False
    request: dict[str, Any]
    results: dict[str, Any] = Field(default_factory=dict)
    attempts: list[dict[str, Any]] = Field(default_factory=list)
    plan_id: Optional[str] = None
    proposal_id: Optional[str] = None
    next_action: Optional[str] = None
    explanation: Optional[dict[str, Any]] = None
    error: Optional[dict[str, Any]] = None

    def persisted(self) -> dict[str, Any]:
        return self.model_dump(mode="json", exclude={"workflow_id"})
