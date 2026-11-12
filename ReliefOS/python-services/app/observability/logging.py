"""Structured JSON logs to stderr (stdout carries the MCP protocol in stdio mode). No secrets are logged."""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from typing import Any


def log(event: str, **fields: Any) -> None:
    record = {"ts": datetime.now(timezone.utc).isoformat(), "event": event, **fields}
    print(json.dumps(record, default=str), file=sys.stderr, flush=True)
