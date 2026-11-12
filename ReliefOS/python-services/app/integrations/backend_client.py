"""Authenticated async client for the ReliefOS Express API (the only path to persistence).

The agent service token grants agent scope: drafts, proposals, validation reports, workflow
records and SIMULATED failures. Express refuses it for approvals, payments and delivery receipts.
"""
from __future__ import annotations

from typing import Any

import httpx

from ..config import get_settings


class BackendError(Exception):
    def __init__(self, status: int | None, code: str | None, message: str):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message

    @property
    def transient(self) -> bool:
        return self.status is None or self.status >= 500 or self.status == 429


class BackendClient:
    def __init__(self, correlation_id: str | None = None, transport: httpx.AsyncBaseTransport | None = None):
        settings = get_settings()
        headers = {"Content-Type": "application/json"}
        if settings.agent_token:
            headers["X-Service-Token"] = settings.agent_token
        else:
            # Development: the API runs without an agent token; identify as the agent service anyway.
            headers["X-Service-Token"] = "dev"
        if correlation_id:
            headers["X-Correlation-Id"] = correlation_id
        self._client = httpx.AsyncClient(base_url=settings.api_url, headers=headers, timeout=60, transport=transport)

    async def __aenter__(self) -> "BackendClient":
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self._client.aclose()

    async def request(self, method: str, path: str, *, json: Any = None, params: dict[str, Any] | None = None,
                      idempotency_key: str | None = None) -> Any:
        headers = {"Idempotency-Key": idempotency_key} if idempotency_key else None
        try:
            response = await self._client.request(
                method, path, json=json, params={k: v for k, v in (params or {}).items() if v is not None}, headers=headers
            )
        except httpx.HTTPError as error:
            raise BackendError(None, "BACKEND_UNREACHABLE", f"ReliefOS API unreachable: {error}") from error
        try:
            body = response.json()
        except ValueError:
            body = None
        if response.status_code >= 400 or not isinstance(body, dict):
            code = body.get("code") if isinstance(body, dict) else None
            message = (body.get("message") if isinstance(body, dict) else None) or f"HTTP {response.status_code}"
            raise BackendError(response.status_code, code, message)
        return body.get("data")

    async def get(self, path: str, **params: Any) -> Any:
        return await self.request("GET", path, params=params)

    async def post(self, path: str, body: dict[str, Any] | None = None, *, idempotency_key: str | None = None) -> Any:
        payload = {k: v for k, v in (body or {}).items() if v is not None}
        return await self.request("POST", path, json=payload, idempotency_key=idempotency_key)

    async def patch(self, path: str, body: dict[str, Any]) -> Any:
        return await self.request("PATCH", path, json={k: v for k, v in body.items() if v is not None})
