"""MCP over stdio for local clients (Claude Code / Claude Desktop): python -m app.mcp"""
from .server import load_tools

if __name__ == "__main__":
    load_tools().run("stdio")
