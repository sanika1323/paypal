"""Test harness.

Unit tests run anywhere. Integration tests need a ReliefOS API backed by a THROWAWAY database:
  RELIEFOS_E2E_API_URL=http://localhost:4100/api
  RELIEFOS_E2E_COORDINATOR_TOKEN=...   RELIEFOS_E2E_AGENT_TOKEN=...
They refuse any non-local API so they can never touch the Neon demo database.
"""
import os
import socket
import subprocess
import sys
import tempfile
import time
import uuid
from urllib.parse import urlparse

import httpx
import pytest

E2E_URL = os.environ.get("RELIEFOS_E2E_API_URL")
COORD = os.environ.get("RELIEFOS_E2E_COORDINATOR_TOKEN", "")
AGENT = os.environ.get("RELIEFOS_E2E_AGENT_TOKEN", "")
MCP_WRITE, MCP_READ = "mcp-write-test", "mcp-read-test"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _local(url: str) -> bool:
    return urlparse(url).hostname in {"localhost", "127.0.0.1", "::1"}


requires_api = pytest.mark.skipif(not E2E_URL or not _local(E2E_URL),
                                  reason="set RELIEFOS_E2E_API_URL to a LOCAL test API (never Neon)")


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="session")
def agent_service():
    """The real agent service (FastAPI + MCP Streamable HTTP) in a subprocess."""
    port = _free_port()
    env = {**os.environ, "RELIEFOS_API_URL": E2E_URL or "http://127.0.0.1:9/api", "RELIEFOS_AGENT_TOKEN": AGENT,
           "RELIEFOS_MCP_TOKEN": MCP_WRITE, "RELIEFOS_MCP_READONLY_TOKEN": MCP_READ, "AGENTS_PORT": str(port),
           "ANTHROPIC_API_KEY": ""}
    log_file = tempfile.NamedTemporaryFile(prefix="reliefos-agents-", suffix=".log", delete=False)
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--port", str(port), "--log-level", "warning"],
                            cwd=ROOT, env=env, stdout=log_file, stderr=subprocess.STDOUT)
    base = f"http://127.0.0.1:{port}"
    for _ in range(100):
        try:
            if httpx.get(f"{base}/ai/status", timeout=1).status_code == 200:
                break
        except httpx.HTTPError:
            time.sleep(0.1)
    else:
        proc.kill()
        raise RuntimeError(open(log_file.name).read()[-2000:])
    yield base
    proc.terminate()
    proc.wait(timeout=10)


class Api:
    def __init__(self, token: str):
        self.client = httpx.Client(base_url=E2E_URL or "", headers={"Authorization": f"Bearer {token}"}, timeout=30)

    def call(self, method: str, path: str, body: dict | None = None):
        r = self.client.request(method, path, json=body)
        data = r.json()
        assert r.status_code < 400, f"{method} {path} -> {r.status_code} {data}"
        return data["data"]


@pytest.fixture()
def coordinator() -> Api:
    return Api(COORD)


@pytest.fixture()
def scenario(coordinator: Api) -> dict:
    """Fresh, uniquely named demo-shaped data created through the API as a coordinator."""
    tag = uuid.uuid4().hex[:6]
    c = coordinator.call
    emergency = c("POST", "/emergencies", {"name": f"Flood Relief {tag}", "location": "Nagpur", "severity": "HIGH",
                                           "latitude": 21.1458, "longitude": 79.0882})
    product = c("POST", "/products", {"name": f"Drinking Water Kit {tag}", "category": "Water", "unit": "box"})
    ngo = c("POST", "/organizations", {"name": f"Relief Support {tag}", "type": "NGO", "email": f"ngo{tag}@example.org"})
    vendors = {}
    for key, name, price, cap, days in [("maharashtra", "Maharashtra Relief Supplies", "180", 1000, 2),
                                        ("bihar", "Bihar Emergency Traders", "165", 600, 3),
                                        ("rapid", "Rapid Aqua Logistics", "190", 1000, 1)]:
        v = c("POST", "/vendors", {"name": f"{name} {tag}", "location": "India"})
        o = c("POST", "/vendor-offers", {"vendorId": v["id"], "productId": product["id"], "unitPrice": price,
                                         "capacity": cap, "deliveryDays": days})
        vendors[key] = {"vendor": v, "offer": o}
    request = c("POST", "/relief-requests", {"organizationId": ngo["id"], "emergencyId": emergency["id"],
                                             "productId": product["id"], "quantity": 300, "urgency": 5})
    return {"emergency": emergency, "product": product, "ngo": ngo, "vendors": vendors, "request": request}
