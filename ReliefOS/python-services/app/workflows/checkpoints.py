"""Workflow persistence through the ReliefOS API (/api/agent-workflows). The agent service never
writes to PostgreSQL directly."""
import datetime as dt
from typing import Any, Optional

from ..integrations.backend_client import BackendClient, BackendError
from ..observability.logging import log


def _summary(value: Any, limit: int = 4000) -> Any:
    """Keep stored step summaries bounded."""
    import json

    text = json.dumps(value, default=str)
    if len(text) <= limit:
        return json.loads(text)
    return {"truncated": True, "preview": text[:limit]}


class WorkflowRecorder:
    def __init__(self, api: BackendClient, workflow_id: Optional[str] = None):
        self.api = api
        self.workflow_id = workflow_id

    async def start(self, *, type: str, trigger: str, state: dict, emergency_id: str | None = None, plan_id: str | None = None,
                    failure_event_id: str | None = None, is_simulation: bool = False) -> str:
        wf = await self.api.post("/agent-workflows", {
            "type": type, "trigger": trigger, "state": state, "emergencyId": emergency_id, "planId": plan_id,
            "failureEventId": failure_event_id, "isSimulation": is_simulation,
        })
        self.workflow_id = wf["id"]
        return wf["id"]

    async def step(self, *, agent: str, kind: str, status: str, started: dt.datetime, duration_ms: int, tool: str | None = None,
                   input_summary: Any = None, output_summary: Any = None, error: str | None = None, attempt: int | None = None,
                   correlation_id: str | None = None) -> None:
        if not self.workflow_id:
            return
        try:
            await self.api.post(f"/agent-workflows/{self.workflow_id}/steps", {
                "agent": agent, "kind": kind, "tool": tool, "status": status, "startedAt": started.isoformat(),
                "durationMs": max(0, duration_ms), "inputSummary": _summary(input_summary) if input_summary is not None else None,
                "outputSummary": _summary(output_summary) if output_summary is not None else None,
                "error": error[:4000] if error else None, "attempt": attempt, "correlationId": correlation_id,
            })
        except BackendError as e:  # a trace write failing must not corrupt the business flow; it is logged
            log("workflow.step.record_failed", workflow_id=self.workflow_id, code=e.code, message=e.message)

    async def checkpoint(self, state: dict, checkpoint: str, status: str = "RUNNING", error: str | None = None,
                         plan_id: str | None = None, proposal_id: str | None = None) -> None:
        await self.api.patch(f"/agent-workflows/{self.workflow_id}", {
            "state": state, "checkpoint": checkpoint, "status": status, "error": error, "planId": plan_id, "proposalId": proposal_id,
        })

    async def load(self, workflow_id: str) -> dict:
        self.workflow_id = workflow_id
        return await self.api.get(f"/agent-workflows/{workflow_id}")
