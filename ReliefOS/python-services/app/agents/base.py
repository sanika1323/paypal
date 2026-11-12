"""Shared agent machinery: allowed-tool guard, MCP calls with bounded retries, step tracing and
optional LLM explanations. Agents hold no business logic that produces numbers."""
import asyncio
import datetime as dt
import time
import uuid
from typing import Any, Callable

from ..integrations.llm_client import explain
from ..mcp.client import MCPClient, MCPToolError
from ..workflows.checkpoints import WorkflowRecorder


class ToolNotAllowed(Exception):
    pass


class BaseAgent:
    name = "BASE_AGENT"
    allowed_tools: frozenset[str] = frozenset()
    max_attempts = 3

    def __init__(self, mcp: MCPClient, recorder: WorkflowRecorder, workflow_id: str | None = None):
        self.mcp = mcp
        self.recorder = recorder
        self.workflow_id = workflow_id

    async def call(self, tool: str, **args: Any) -> Any:
        if tool not in self.allowed_tools:
            raise ToolNotAllowed(f"{self.name} may not call '{tool}'")
        attempt = 0
        while True:
            attempt += 1
            started, t0, cid = dt.datetime.now(dt.timezone.utc), time.monotonic(), uuid.uuid4().hex[:16]
            try:
                result = await self.mcp.call_tool(tool, args)
            except MCPToolError as error:
                await self.recorder.step(agent=self.name, kind="MCP_TOOL", tool=tool, status="FAILED", started=started,
                                         duration_ms=int((time.monotonic() - t0) * 1000), input_summary=args,
                                         error=f"{error.code}: {error.message}", attempt=attempt, correlation_id=cid)
                if error.transient and attempt < self.max_attempts:
                    await asyncio.sleep(0.5 * 2 ** (attempt - 1))
                    continue
                raise
            await self.recorder.step(agent=self.name, kind="MCP_TOOL", tool=tool, status="COMPLETED", started=started,
                                     duration_ms=int((time.monotonic() - t0) * 1000), input_summary=args, output_summary=result,
                                     attempt=attempt, correlation_id=cid)
            return result

    async def decide(self, label: str, inputs: Any, fn: Callable[[], Any]) -> Any:
        """A deterministic decision made in code (recorded so the trace shows why the flow branched)."""
        started, t0 = dt.datetime.now(dt.timezone.utc), time.monotonic()
        out = fn()
        await self.recorder.step(agent=self.name, kind="DETERMINISTIC", tool=label, status="COMPLETED", started=started,
                                 duration_ms=int((time.monotonic() - t0) * 1000), input_summary=inputs, output_summary=out)
        return out

    async def narrate(self, task: str, data: Any) -> dict:
        started, t0 = dt.datetime.now(dt.timezone.utc), time.monotonic()
        out = await explain(task, data)
        await self.recorder.step(agent=self.name, kind="AI_REASONING", tool="explain", status="COMPLETED" if out["available"] else "SKIPPED",
                                 started=started, duration_ms=int((time.monotonic() - t0) * 1000),
                                 output_summary={"text": out.get("text")} if out["available"] else {"unavailable": out.get("reason")})
        return out
