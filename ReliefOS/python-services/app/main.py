"""ReliefOS agent service (:8001).

  GET  /health                     liveness + backend reachability
  GET  /ai/status                  optional LLM availability (explanations only)
  GET  /mcp/info                   registered MCP tools with scopes
  POST /workflows/procurement      Demand -> Supplier -> Allocation -> DRAFT -> submit -> WAITING_FOR_HUMAN
  POST /workflows/replanning       failure -> proposal -> independent revalidation -> human
  POST /workflows/{id}/resume      re-check a WAITING_FOR_HUMAN workflow after a human decision
  /mcp                             MCP Streamable HTTP endpoint (bearer-token scopes)

Run:  uvicorn app.main:app --port 8001      MCP over stdio:  python -m app.mcp
"""
import contextlib
from typing import Any, AsyncIterator

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.types import Receive, Scope, Send

from .config import get_settings
from .integrations.backend_client import BackendClient, BackendError
from .integrations.llm_client import llm_status
from .mcp.client import MCPClient
from .mcp.security import MCPAuthMiddleware
from .mcp.server import TOOL_REGISTRY, load_tools
from .workflows.procurement_workflow import resume_procurement, run_procurement
from .workflows.replanning_workflow import resume_replanning, run_replanning
from .workflows.runtime import Runtime
from .workflows.state import ProcurementRequest, ReplanningRequest, WorkflowState

settings = get_settings()
mcp_server = load_tools()
mcp_http = mcp_server.streamable_http_app()  # creates the session manager; route: /mcp


@contextlib.asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    async with mcp_server.session_manager.run():
        yield


api = FastAPI(title="ReliefOS Agent Service", version="2.0.0", lifespan=lifespan)
api.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
                   allow_methods=["GET", "POST"], allow_headers=["*"])


async def _require_coordinator(authorization: str | None) -> None:
    """Workflows act with the agent token, so starting one needs the same coordinator token the
    Express API requires (checked by Express itself). Open only when Express reports auth disabled."""
    async with BackendClient() as client:
        try:
            status = await client.get("/auth/status")
        except BackendError as e:
            raise HTTPException(503, {"code": "BACKEND_UNREACHABLE", "message": e.message})
        if not status.get("coordinatorAuthRequired"):
            return
        token = authorization[7:].strip() if authorization and authorization.lower().startswith("bearer ") else None
        if not token:
            raise HTTPException(401, {"code": "COORDINATOR_AUTH_REQUIRED", "message": "Coordinator token required"})
        try:
            await client.post("/auth/verify", {"token": token})
        except BackendError:
            raise HTTPException(401, {"code": "INVALID_TOKEN", "message": "Invalid coordinator token"})


async def _with_runtime(fn: Any, *args: Any) -> dict:
    async with BackendClient() as client, MCPClient() as mcp_client:
        state: WorkflowState = await fn(Runtime(mcp_client, client), *args)
        return state.model_dump(mode="json")


@api.get("/health")
async def health() -> dict:
    backend: dict[str, Any] = {"url": settings.api_url}
    async with BackendClient() as client:
        try:
            backend["auth"] = await client.get("/auth/status")
            backend["reachable"] = True
        except BackendError as e:
            backend.update(reachable=False, error=e.message)
    return {"status": "ok", "service": "reliefos-agents", "backend": backend, "mcpTools": len(TOOL_REGISTRY),
            "llm": llm_status()["available"]}


@api.get("/ai/status")
async def ai_status() -> dict:
    return llm_status()


@api.get("/mcp/info")
async def mcp_info() -> dict:
    return {"endpoint": "/mcp", "transport": "streamable-http", "tools": TOOL_REGISTRY,
            "auth": "bearer" if (settings.mcp_token or settings.mcp_readonly_token) else "open (development)"}


@api.post("/workflows/procurement")
async def procurement(req: ProcurementRequest, authorization: str | None = Header(default=None)) -> dict:
    await _require_coordinator(authorization)
    return await _with_runtime(run_procurement, req)


@api.post("/workflows/replanning")
async def replanning(req: ReplanningRequest, authorization: str | None = Header(default=None)) -> dict:
    await _require_coordinator(authorization)
    return await _with_runtime(run_replanning, req)


@api.post("/workflows/{workflow_id}/resume")
async def resume(workflow_id: str, authorization: str | None = Header(default=None)) -> dict:
    await _require_coordinator(authorization)

    async def run(rt: Runtime) -> WorkflowState:
        try:
            state = await rt.attach(workflow_id)
        except BackendError as e:
            raise HTTPException(e.status or 502, {"code": e.code, "message": e.message})
        if state.status != "WAITING_FOR_HUMAN":
            return state
        return await (resume_procurement if state.type == "PROCUREMENT" else resume_replanning)(rt, state)

    return await _with_runtime(run)


class App:
    """Routes /mcp to the MCP Streamable HTTP app (behind bearer auth); everything else to FastAPI."""

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http" and scope["path"].rstrip("/") == "/mcp":
            await MCPAuthMiddleware(mcp_http)(scope, receive, send)
        else:
            await api(scope, receive, send)


app = App()



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)
