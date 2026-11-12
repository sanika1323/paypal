from typing import Annotated, Optional

from pydantic import Field

EmergencyId = Annotated[str, Field(description="Emergency id")]
PlanId = Annotated[str, Field(description="Procurement plan id")]
ProposalId = Annotated[str, Field(description="Replanning proposal id")]
Budget = Annotated[float, Field(gt=0, description="Budget in INR")]
MaxDays = Annotated[Optional[int], Field(gt=0, description="Maximum supplier delivery time in days")]
WorkflowId = Annotated[Optional[str], Field(description="Workflow id, used to derive idempotency keys for retries")]
