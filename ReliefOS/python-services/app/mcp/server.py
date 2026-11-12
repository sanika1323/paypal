"""ReliefOS MCP server (official MCP Python SDK, FastMCP).

Tools are thin, typed adapters over the ReliefOS Express API. Every tool declares a scope
("read" or "write"); write tools never include approval, rejection, payment capture or delivery
confirmation, which remain human-only REST actions.
"""
import functools
import hashlib
import inspect
import json
import time
import uuid
from typing import Any, Awaitable, Callable

from mcp.server.fastmcp import Context, FastMCP

from ..config import get_settings
from ..integrations.backend_client import BackendClient, BackendError
from ..observability.logging import log
from .security import SCOPE_ORDER, scope_from_context

settings = get_settings()

mcp = FastMCP(
    "reliefos",
    instructions=(
        "ReliefOS collective emergency procurement. Read tools inspect live records; write tools create "
        "drafts, proposals, validation reports and simulated failures through the ReliefOS backend. "
        "No tool can approve, reject, pay or confirm deliveries: those are human-only. All quantities and "
        "prices come from the deterministic optimizer, never from the model."
    ),
    host=settings.host,
    port=settings.port,
    stateless_http=True,
    json_response=True,
)

TOOL_REGISTRY: dict[str, dict[str, str]] = {}


class ToolError(Exception):
    """Structured tool error surfaced to MCP clients as isError with a JSON body."""

    def __init__(self, code: str, message: str):
        super().__init__(json.dumps({"code": code, "message": message}))


def derive_idempotency_key(tool: str, workflow_id: str | None, args: dict[str, Any]) -> str | None:
    if not workflow_id:
        return None
    digest = hashlib.sha256(json.dumps(args, sort_keys=True, default=str).encode()).hexdigest()[:24]
    return f"{workflow_id}:{tool}:{digest}"


def reliefos_tool(scope: str, domain: str, title: str) -> Callable[[Callable[..., Awaitable[Any]]], Any]:
    """Register a tool with a scope. The wrapped function receives a BackendClient as `api`."""
    assert scope in SCOPE_ORDER

    def decorator(fn: Callable[..., Awaitable[Any]]) -> Any:
        sig = inspect.signature(fn)
        params = [p for name, p in sig.parameters.items() if name != "api"]
        if "ctx" not in sig.parameters:
            params.append(inspect.Parameter("ctx", inspect.Parameter.KEYWORD_ONLY, annotation=Context, default=None))
        public_sig = sig.replace(parameters=params)

        @functools.wraps(fn)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            ctx = kwargs.get("ctx")
            caller_scope = scope_from_context(ctx) if ctx is not None else settings.stdio_scope
            correlation_id = uuid.uuid4().hex[:16]
            started = time.monotonic()
            if SCOPE_ORDER.get(caller_scope, -1) < SCOPE_ORDER[scope]:
                log("mcp.tool.denied", tool=fn.__name__, required=scope, caller=caller_scope, correlation_id=correlation_id)
                raise ToolError("SCOPE_DENIED", f"Tool '{fn.__name__}' requires '{scope}' scope; caller has '{caller_scope}'.")
            call_kwargs = {k: v for k, v in kwargs.items() if k != "ctx" or "ctx" in sig.parameters}
            try:
                async with BackendClient(correlation_id=correlation_id) as api:
                    result = await fn(*args, api=api, **call_kwargs)
            except BackendError as error:
                log("mcp.tool.error", tool=fn.__name__, status=error.status, code=error.code,
                    duration_ms=int((time.monotonic() - started) * 1000), correlation_id=correlation_id)
                raise ToolError(error.code or "BACKEND_ERROR", error.message) from error
            log("mcp.tool.ok", tool=fn.__name__, scope=scope, duration_ms=int((time.monotonic() - started) * 1000),
                correlation_id=correlation_id)
            return result

        wrapper.__signature__ = public_sig  # type: ignore[attr-defined]
        wrapper.__annotations__ = {**{k: v for k, v in fn.__annotations__.items() if k != "api"}, "ctx": Context}
        del wrapper.__wrapped__  # FastMCP must see the public signature, not the inner one
        TOOL_REGISTRY[fn.__name__] = {"scope": scope, "domain": domain, "title": title}
        return mcp.tool(
            name=fn.__name__,
            title=title,
            description=(fn.__doc__ or title).strip() + f"\n\n[scope: {scope}]",
            annotations={"readOnlyHint": scope == "read", "destructiveHint": False, "idempotentHint": scope == "read"},
        )(wrapper)

    return decorator


def load_tools() -> FastMCP:
    """Import tool, resource and prompt modules (registration side effects) and return the server."""
    from . import prompts, resources  # noqa: F401
    from .tools import (  # noqa: F401
        approval_tools, audit_tools, demand_tools, emergency_tools, fulfilment_tools,
        payment_tools, procurement_tools, replanning_tools, revalidation_tools, supplier_tools,
    )
    return mcp
