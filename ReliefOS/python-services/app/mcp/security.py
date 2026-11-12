"""MCP access control.

Streamable HTTP clients present `Authorization: Bearer <token>`:
  RELIEFOS_MCP_TOKEN          -> scope "write" (read + write tools)
  RELIEFOS_MCP_READONLY_TOKEN -> scope "read"  (read tools only)
Local stdio clients get MCP_STDIO_SCOPE (default "write").
If no MCP tokens are configured, HTTP is open with "write" scope (local development).
"""
import hmac
from typing import Any

from starlette.types import ASGIApp, Receive, Scope, Send

from ..config import get_settings

SCOPE_ORDER = {"read": 0, "write": 1}


def scope_for_token(token: str | None) -> str | None:
    settings = get_settings()
    if not settings.mcp_token and not settings.mcp_readonly_token:
        return "write"
    if token and settings.mcp_token and hmac.compare_digest(token, settings.mcp_token):
        return "write"
    if token and settings.mcp_readonly_token and hmac.compare_digest(token, settings.mcp_readonly_token):
        return "read"
    return None


def bearer_from_headers(headers: Any) -> str | None:
    value = headers.get("authorization") if headers is not None else None
    if isinstance(value, str) and value.lower().startswith("bearer "):
        return value[7:].strip()
    return None


def scope_from_context(ctx: Any) -> str:
    """Scope for the current tool call: HTTP request header, or the stdio default."""
    request = None
    try:
        request = ctx.request_context.request
    except (AttributeError, LookupError, ValueError):
        request = None
    if request is None:
        return get_settings().stdio_scope if get_settings().stdio_scope in SCOPE_ORDER else "read"
    return scope_for_token(bearer_from_headers(request.headers)) or "none"


class MCPAuthMiddleware:
    """Rejects unauthenticated HTTP requests to /mcp before they reach the MCP session manager."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            headers = {k.decode().lower(): v.decode() for k, v in scope.get("headers", [])}
            if scope_for_token(bearer_from_headers(headers)) is None:
                body = b'{"jsonrpc":"2.0","error":{"code":-32001,"message":"Unauthorized: valid MCP bearer token required"},"id":null}'
                await send({"type": "http.response.start", "status": 401,
                            "headers": [(b"content-type", b"application/json"), (b"www-authenticate", b"Bearer")]})
                await send({"type": "http.response.body", "body": body})
                return
        await self.app(scope, receive, send)
