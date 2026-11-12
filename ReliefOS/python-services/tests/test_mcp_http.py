"""MCP Streamable HTTP: discovery, invocation and scope enforcement against the real service."""
import httpx
import pytest

from app.mcp.client import MCPClient, MCPToolError

from .conftest import MCP_READ, MCP_WRITE, requires_api


async def test_unauthenticated_mcp_request_is_rejected(agent_service):
    r = httpx.post(f"{agent_service}/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"},
                   headers={"Accept": "application/json, text/event-stream"})
    assert r.status_code == 401


async def test_discovery_over_http(agent_service):
    async with MCPClient(transport="http", url=f"{agent_service}/mcp", token=MCP_READ) as client:
        tools = await client.list_tools()
        assert "generate_replanning_proposal" in tools and "validate_revised_plan" in tools


@requires_api
async def test_read_scope_can_read_but_not_write(agent_service, scenario):
    async with MCPClient(transport="http", url=f"{agent_service}/mcp", token=MCP_READ) as client:
        demand = await client.call_tool("consolidate_emergency_demand", {"emergency_id": scenario["emergency"]["id"]})
        assert demand["products"][0]["totalQuantity"] == 300
        with pytest.raises(MCPToolError) as denied:
            await client.call_tool("create_procurement_plan", {"emergency_id": scenario["emergency"]["id"], "budget": 200000})
        assert denied.value.code == "SCOPE_DENIED"


@requires_api
async def test_write_scope_invokes_deterministic_optimizer(agent_service, scenario):
    async with MCPClient(transport="http", url=f"{agent_service}/mcp", token=MCP_WRITE) as client:
        preview = await client.call_tool("run_procurement_optimization", {"emergency_id": scenario["emergency"]["id"], "budget": 200000})
        assert preview["estimatedCost"] == "49500.00"
        assert preview["supplierPurchases"][0]["offerId"] == scenario["vendors"]["bihar"]["offer"]["id"]


@requires_api
async def test_agent_tools_cannot_report_real_failures(agent_service, scenario):
    """report_supplier_failure always files a labelled simulation; stored offers stay unchanged."""
    bihar = scenario["vendors"]["bihar"]
    async with MCPClient(transport="http", url=f"{agent_service}/mcp", token=MCP_WRITE) as client:
        out = await client.call_tool("report_supplier_failure", {
            "failure_type": "SUPPLIER_UNAVAILABLE", "vendor_id": bihar["vendor"]["id"], "reason": "what if Bihar goes offline"})
        assert out["isSimulation"] is True
        offers = await client.call_tool("get_vendor_offers", {"vendor_id": bihar["vendor"]["id"]})
        assert offers["offers"][0]["isAvailable"] is True
