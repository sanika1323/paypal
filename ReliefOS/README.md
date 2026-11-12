# ReliefOS 2.0

Setup, run instructions, demo flow and tests are in the repository root [README](../README.md).

- `server/` — Express + Prisma API (system of record, PayPal Sandbox, deliveries, replanning). Architecture: [server/docs/ARCHITECTURE.md](server/docs/ARCHITECTURE.md)
- `python-services/` — AI agents + MCP server (FastAPI, MCP Python SDK). See [python-services/README.md](python-services/README.md)
- `client/` — React + Vite + AG Grid web app
