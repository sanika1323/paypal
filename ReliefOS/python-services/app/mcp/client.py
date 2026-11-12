"""MCP client used by the agents. Agents reach ReliefOS only through MCP tools.

Transports:
  memory (default) - a real MCP ClientSession connected in-process to this service's MCP server.
  http             - Streamable HTTP to an MCP endpoint (MCP_CLIENT_URL), with a bearer token.
"""
import json
import os
from contextlib import AsyncExitStack
from typing import Any

from mcp import ClientSession
from mcp.types import CallToolResult

from ..config import get_settings


class MCPToolError(Exception):
    def __init__(self, tool: str, code: str, message: str):
        super().__init__(f"{tool}: {code}: {message}")
        self.tool = tool
        self.code = code
        self.message = message

    @property
    def transient(self) -> bool:
        return self.code in {"BACKEND_UNREACHABLE", "INTERNAL_ERROR", "BACKEND_ERROR", "RATE_LIMITED"}


def _parse_result(tool: str, result: CallToolResult) -> Any:
    text = "".join(getattr(c, "text", "") for c in result.content)
    if result.isError:
        try:
            body = json.loads(text[text.index("{"):]) if "{" in text else {}
        except ValueError:
            body = {}
        raise MCPToolError(tool, body.get("code", "TOOL_ERROR"), body.get("message", text or "Tool failed"))
    if result.structuredContent is not None:
        sc = result.structuredContent
        # FastMCP wraps non-object returns as {"result": ...}
        return sc["result"] if set(sc.keys()) == {"result"} else sc
    try:
        return json.loads(text) if text else None
    except ValueError:
        return text


class MCPClient:
    """Async context manager exposing call_tool / list_tools over a live MCP session."""

    def __init__(self, transport: str | None = None, url: str | None = None, token: str | None = None):
        settings = get_settings()
        self.transport = (transport or os.environ.get("MCP_CLIENT_TRANSPORT") or "memory").lower()
        self.url = url or os.environ.get("MCP_CLIENT_URL") or settings.mcp_url
        self.token = token if token is not None else settings.mcp_token
        self._stack = AsyncExitStack()
        self.session: ClientSession | None = None

    async def __aenter__(self) -> "MCPClient":
        if self.transport == "memory":
            from mcp.shared.memory import create_connected_server_and_client_session

            from .server import load_tools

            server = load_tools()
            self.session = await self._stack.enter_async_context(create_connected_server_and_client_session(server._mcp_server))
        elif self.transport == "http":
            headers = {"Authorization": f"Bearer {self.token}"} if self.token else None
            try:  # mcp >= 1.24
                from mcp.client.streamable_http import streamable_http_client
                from mcp.shared._httpx_utils import create_mcp_http_client

                http = await self._stack.enter_async_context(create_mcp_http_client(headers=headers))
                transport = streamable_http_client(self.url, http_client=http)
            except ImportError:
                from mcp.client.streamable_http import streamablehttp_client

                transport = streamablehttp_client(self.url, headers=headers)
            read, write, _ = await self._stack.enter_async_context(transport)
            self.session = await self._stack.enter_async_context(ClientSession(read, write))
            await self.session.initialize()
        else:
            raise ValueError(f"Unknown MCP transport '{self.transport}'")
        return self

    async def __aexit__(self, *exc: Any) -> None:
        await self._stack.aclose()

    async def list_tools(self) -> list[str]:
        assert self.session
        return [t.name for t in (await self.session.list_tools()).tools]

    async def call_tool(self, name: str, arguments: dict[str, Any]) -> Any:
        assert self.session
        result = await self.session.call_tool(name, {k: v for k, v in arguments.items() if v is not None})
        return _parse_result(name, result)
