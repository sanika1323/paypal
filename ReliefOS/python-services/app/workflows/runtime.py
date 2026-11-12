"""Workflow runtime: one MCP session + one recorder per run, checkpointing after every stage, and a
single place that turns tool failures into a FAILED workflow (never a half-silent success)."""
import datetime as dt
from typing import Any, Awaitable, Callable, Optional, TypeVar

from ..agents.base import BaseAgent, ToolNotAllowed
from ..integrations.backend_client import BackendClient
from ..mcp.client import MCPClient, MCPToolError
from ..observability.logging import log
from .checkpoints import WorkflowRecorder
from .state import WorkflowState

A = TypeVar("A", bound=BaseAgent)


class Runtime:
    def __init__(self, mcp: MCPClient, api: BackendClient):
        self.mcp = mcp
        self.recorder = WorkflowRecorder(api)

    def agent(self, cls: type[A]) -> A:
        return cls(self.mcp, self.recorder, self.recorder.workflow_id)

    async def start(self, state: WorkflowState, *, trigger: str, emergency_id: Optional[str] = None, plan_id: Optional[str] = None,
                    failure_event_id: Optional[str] = None) -> None:
        state.workflow_id = await self.recorder.start(
            type=state.type, trigger=trigger, state=state.persisted(), emergency_id=emergency_id, plan_id=plan_id,
            failure_event_id=failure_event_id, is_simulation=state.is_simulation)
        log("workflow.started", workflow_id=state.workflow_id, type=state.type)

    async def attach(self, workflow_id: str) -> WorkflowState:
        wf = await self.recorder.load(workflow_id)
        return WorkflowState(workflow_id=wf["id"], **wf["state"])

    async def save(self, state: WorkflowState, checkpoint: str) -> None:
        state.checkpoint = checkpoint
        await self.recorder.checkpoint(state.persisted(), checkpoint, state.status,
                                       error=(state.error or {}).get("message"), plan_id=state.plan_id, proposal_id=state.proposal_id)

    @staticmethod
    def finish(state: WorkflowState, checkpoint: str, next_action: str) -> None:
        state.status, state.checkpoint, state.next_action = "COMPLETED", checkpoint, next_action

    @staticmethod
    def interrupt(state: WorkflowState, checkpoint: str, next_action: str) -> None:
        state.status, state.checkpoint, state.next_action = "WAITING_FOR_HUMAN", checkpoint, next_action

    async def execute(self, state: WorkflowState, body: Callable[[], Awaitable[Any]]) -> None:
        try:
            await body()
        except MCPToolError as error:
            state.status = "FAILED"
            state.error = {"tool": error.tool, "code": error.code, "message": error.message}
            state.next_action = "Fix the reported problem and start a new workflow."
            log("workflow.failed", workflow_id=state.workflow_id, tool=error.tool, code=error.code)
        except ToolNotAllowed as error:
            state.status = "FAILED"
            state.error = {"code": "TOOL_NOT_ALLOWED", "message": str(error)}
        await self.save(state, state.checkpoint)

    async def human_observation(self, state: WorkflowState, label: str, observed: Any) -> None:
        now = dt.datetime.now(dt.timezone.utc)
        await self.recorder.step(agent="HUMAN", kind="HUMAN_ACTION", tool=label, status="OBSERVED", started=now, duration_ms=0,
                                 output_summary=observed)

    async def explain(self, state: WorkflowState, agent: BaseAgent, task: str) -> None:
        state.explanation = await agent.narrate(task, {"status": state.status, "checkpoint": state.checkpoint,
                                                       "nextAction": state.next_action, "results": state.results,
                                                       "attempts": state.attempts, "error": state.error})
        await self.save(state, state.checkpoint)
