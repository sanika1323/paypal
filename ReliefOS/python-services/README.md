# ReliefOS agent service + MCP server

FastAPI service on **:8001** and the ReliefOS **MCP server** (official MCP Python SDK). It never touches the
database: every read and write goes to the ReliefOS API with `X-Service-Token: RELIEFOS_AGENT_TOKEN`.

```
app/
  main.py                 FastAPI: /health, /ai/status, /mcp/info, /workflows/*, and /mcp (Streamable HTTP)
  mcp/server.py           FastMCP server, scope-checked tool decorator, idempotency keys
  mcp/tools/*.py          36 tools (emergency, demand, supplier, procurement, approval, payment,
                          replanning, revalidation, fulfilment, audit)
  mcp/resources.py        reliefos://playbook, emergencies/{id}, plans/{id}, suppliers/catalog, workflows/{id}
  mcp/prompts.py          procurement-analysis, supplier-failure-recovery, proposal-revalidation, supplier-risk-explanation
  mcp/client.py           MCP client used by the agents (in-memory session, or HTTP)
  agents/                 orchestrator + demand, supplier, allocation, fulfilment, replanning, revalidation
  workflows/              procurement and replanning workflows, checkpoints, typed state
  integrations/           ReliefOS API client, optional Anthropic adapter (explanations only)
```

## Run

```powershell
python -m venv .venv; .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --port 8001     # HTTP + MCP at http://127.0.0.1:8001/mcp
python -m app.mcp                    # MCP over stdio (Claude Code / Claude Desktop / MCP Inspector)
```

## Security

* HTTP MCP clients send `Authorization: Bearer <token>`: `RELIEFOS_MCP_TOKEN` → read + write tools,
  `RELIEFOS_MCP_READONLY_TOKEN` → read tools only. With neither set, `/mcp` is open (development).
* `POST /workflows/*` requires the same coordinator token the API requires (verified by the API).
* No tool approves, rejects, pays, captures, reports a real failure or confirms a delivery.
* Each agent has an allow-list of tools; calls outside it raise `ToolNotAllowed`.
* Without `ANTHROPIC_API_KEY`, explanations are reported as unavailable and everything else runs unchanged.

## Tests

```powershell
pytest                                            # unit tests
$env:RELIEFOS_E2E_API_URL="http://localhost:4100/api"   # a LOCAL API on a throwaway database
$env:RELIEFOS_E2E_COORDINATOR_TOKEN="..."; $env:RELIEFOS_E2E_AGENT_TOKEN="..."
pytest                                            # + MCP over HTTP and full workflows
```
