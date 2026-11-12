"""Unit tests: no network."""
import pytest

from app.agents.base import BaseAgent, ToolNotAllowed
from app.agents.revalidation_agent import RevalidationAgent
from app.integrations.llm_client import llm_status
from app.mcp.server import TOOL_REGISTRY, derive_idempotency_key, load_tools
from app.workflows.state import ReplanningRequest

FORBIDDEN = ("approve", "reject", "capture", "confirm", "receipt", "deliver_", "update_delivery")


async def test_tool_catalog_has_no_human_only_actions():
    server = load_tools()
    names = [t.name for t in await server.list_tools()]
    assert len(names) == len(TOOL_REGISTRY) >= 30
    assert not [n for n in names if any(f in n for f in FORBIDDEN)], "human-only actions must not be MCP tools"
    writes = sorted(n for n, m in TOOL_REGISTRY.items() if m["scope"] == "write")
    assert writes == ["create_procurement_plan", "generate_replanning_proposal", "report_supplier_failure",
                      "request_human_approval", "submit_plan_for_approval", "validate_revised_plan"]


async def test_tool_schemas_hide_injected_parameters():
    for tool in await load_tools().list_tools():
        props = tool.inputSchema.get("properties", {})
        assert "api" not in props and "ctx" not in props, tool.name


async def test_resources_and_prompts_registered():
    server = load_tools()
    assert {str(r.uri) for r in await server.list_resources()} == {"reliefos://playbook", "reliefos://suppliers/catalog"}
    assert {t.uriTemplate for t in await server.list_resource_templates()} == {
        "reliefos://emergencies/{emergency_id}", "reliefos://plans/{plan_id}", "reliefos://workflows/{workflow_id}"}
    assert len(await server.list_prompts()) == 4


def test_idempotency_key_is_stable_and_scoped():
    a = derive_idempotency_key("t", "wf1", {"x": 1, "y": 2})
    assert a == derive_idempotency_key("t", "wf1", {"y": 2, "x": 1})
    assert a != derive_idempotency_key("t", "wf2", {"x": 1, "y": 2})
    assert derive_idempotency_key("t", None, {"x": 1}) is None


async def test_agent_cannot_call_tools_outside_its_allow_list():
    class Narrow(BaseAgent):
        allowed_tools = frozenset({"get_procurement_plan"})

    with pytest.raises(ToolNotAllowed):
        await Narrow(mcp=None, recorder=None).call("create_procurement_plan", emergency_id="x", budget=1)  # type: ignore[arg-type]


def _inputs(version="PASS", capacity="PASS", budget="PASS", delta="0.00", sim=False):
    return (
        {"status": version, "expectedVersion": 2, "currentVersion": 2 if version == "PASS" else 3, "planStatus": "APPROVED"},
        {"checks": [{"code": "CAPACITY", "status": capacity, "message": ""}]},
        {"checks": [{"code": "BUDGET", "status": budget, "message": ""}]},
        {"comparison": {"costDelta": delta}, "isSimulation": sim},
    )


@pytest.mark.parametrize("kwargs,expected", [
    ({}, "VALIDATED"),
    ({"delta": "1500.00"}, "VALIDATED_WITH_WARNINGS"),
    ({"sim": True}, "VALIDATED_WITH_WARNINGS"),
    ({"version": "FAIL"}, "REJECTED_VERSION_CONFLICT"),
    ({"capacity": "FAIL"}, "REJECTED_STALE_DATA"),
    ({"budget": "FAIL"}, "REJECTED_INFEASIBLE"),
])
def test_revalidation_outcomes(kwargs, expected):
    assert RevalidationAgent.outcome_from(*_inputs(**kwargs))[0] == expected


def test_replanning_request_needs_exactly_one_source():
    with pytest.raises(ValueError):
        ReplanningRequest(plan_id="p")
    with pytest.raises(ValueError):
        ReplanningRequest(plan_id="p", failure_event_id="e", simulation={"failure_type": "WHAT_IF_SCENARIO", "vendor_id": "v", "reason": "xyz"})


def test_llm_unavailable_without_key(monkeypatch):
    from app import config
    config.get_settings.cache_clear()
    monkeypatch.setenv("ANTHROPIC_API_KEY", "")
    assert llm_status()["available"] is False
    config.get_settings.cache_clear()
