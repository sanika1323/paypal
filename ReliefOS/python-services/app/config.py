from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


def _load_dotenv() -> None:
    """Minimal .env loader; real environment variables take precedence."""
    path = Path(__file__).resolve().parent.parent / ".env"
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()


@dataclass(frozen=True)
class Settings:
    api_url: str
    agent_token: str | None
    mcp_token: str | None
    mcp_readonly_token: str | None
    stdio_scope: str
    host: str
    port: int
    anthropic_api_key: str | None
    anthropic_base_url: str | None
    claude_model: str
    llm_provider: str | None
    llm_api_key: str | None
    llm_base_url: str | None
    llm_model: str | None

    @property
    def mcp_url(self) -> str:
        return f"http://{self.host}:{self.port}/mcp"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    env = os.environ.get
    return Settings(
        api_url=env("RELIEFOS_API_URL", "http://localhost:4000/api").rstrip("/"),
        agent_token=env("RELIEFOS_AGENT_TOKEN") or None,
        mcp_token=env("RELIEFOS_MCP_TOKEN") or None,
        mcp_readonly_token=env("RELIEFOS_MCP_READONLY_TOKEN") or None,
        stdio_scope=(env("MCP_STDIO_SCOPE") or "write").lower(),
        host=env("AGENTS_HOST", "127.0.0.1"),
        port=int(env("AGENTS_PORT", "8001")),
        anthropic_api_key=env("ANTHROPIC_API_KEY") or None,
        anthropic_base_url=env("ANTHROPIC_BASE_URL") or None,
        claude_model=env("CLAUDE_MODEL") or "claude-sonnet-4-5",
        llm_provider=(env("LLM_PROVIDER") or "").strip().lower() or None,
        llm_api_key=env("LLM_API_KEY") or None,
        llm_base_url=env("LLM_BASE_URL") or None,
        llm_model=env("LLM_MODEL") or None,
    )
