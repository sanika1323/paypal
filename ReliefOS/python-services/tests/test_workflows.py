"""End-to-end agent workflows against a local ReliefOS API on a throwaway database."""
import httpx

from .conftest import COORD, Api, requires_api

pytestmark = requires_api
H = {"Authorization": f"Bearer {COORD}"}


def _post(base: str, path: str, body: dict | None = None, headers: dict | None = H) -> dict:
    r = httpx.post(f"{base}{path}", json=body, headers=headers, timeout=120)
    assert r.status_code == 200, r.text
    return r.json()


def _approve_plan(api: Api, plan_id: str) -> None:
    pending = api.call("GET", "/approvals")
    approval = next(a for a in pending if a["planId"] == plan_id)
    api.call("POST", f"/approvals/{approval['id']}/approve", {"approvedBy": "Test Coordinator"})


def test_workflow_endpoints_require_coordinator(agent_service, scenario):
    r = httpx.post(f"{agent_service}/workflows/procurement", json={"emergency_id": scenario["emergency"]["id"], "budget": 1000})
    assert r.status_code == 401


def test_procurement_workflow_waits_for_human_then_resumes(agent_service, scenario, coordinator):
    state = _post(agent_service, "/workflows/procurement", {"emergency_id": scenario["emergency"]["id"], "budget": 200000})
    assert state["status"] == "WAITING_FOR_HUMAN", state
    assert state["checkpoint"] == "awaiting_plan_approval"
    assert state["results"]["optimization"]["estimatedCost"] == "49500.00"
    assert state["explanation"]["available"] is False
    plan_id = state["plan_id"]
    assert coordinator.call("GET", f"/procurement/plans/{plan_id}")["status"] == "PENDING_APPROVAL", "agents cannot approve"

    again = _post(agent_service, f"/workflows/{state['workflow_id']}/resume")
    assert again["status"] == "WAITING_FOR_HUMAN"

    _approve_plan(coordinator, plan_id)
    done = _post(agent_service, f"/workflows/{state['workflow_id']}/resume")
    assert done["status"] == "COMPLETED" and done["checkpoint"] == "plan_approved"

    trace = coordinator.call("GET", f"/agent-workflows/{state['workflow_id']}")
    kinds = {(s["agent"], s["kind"]) for s in trace["steps"]}
    assert ("DEMAND_AGENT", "MCP_TOOL") in kinds and ("ALLOCATION_AGENT", "MCP_TOOL") in kinds and ("HUMAN", "HUMAN_ACTION") in kinds
    assert [s["sequence"] for s in trace["steps"]] == list(range(1, len(trace["steps"]) + 1))


def test_infeasible_budget_persists_nothing(agent_service, scenario, coordinator):
    state = _post(agent_service, "/workflows/procurement", {"emergency_id": scenario["emergency"]["id"], "budget": 1000})
    assert state["status"] == "COMPLETED" and state["checkpoint"] == "infeasible" and state["plan_id"] is None
    plans = coordinator.call("GET", f"/procurement/plans?emergencyId={scenario['emergency']['id']}")
    assert [p for p in plans if p["emergencyId"] == scenario["emergency"]["id"]] == []


def _approved_plan(agent_service, scenario, coordinator) -> str:
    state = _post(agent_service, "/workflows/procurement", {"emergency_id": scenario["emergency"]["id"], "budget": 200000, "explain": False})
    _approve_plan(coordinator, state["plan_id"])
    return state["plan_id"]


def test_simulated_failure_never_changes_the_plan(agent_service, scenario, coordinator):
    plan_id = _approved_plan(agent_service, scenario, coordinator)
    before = coordinator.call("GET", f"/procurement/plans/{plan_id}")
    bihar = scenario["vendors"]["bihar"]
    state = _post(agent_service, "/workflows/replanning", {"plan_id": plan_id, "simulation": {
        "failure_type": "SUPPLIER_UNAVAILABLE", "vendor_id": bihar["vendor"]["id"], "reason": "what if Bihar cannot ship"}})
    assert state["is_simulation"] and state["status"] == "COMPLETED" and state["checkpoint"] == "simulation_reported", state
    assert state["attempts"][0]["mode"] == "REPLACEMENT"
    assert state["attempts"][0]["revisedCost"] == "54000.00"  # 300 x 180 (Maharashtra, next cheapest)
    after = coordinator.call("GET", f"/procurement/plans/{plan_id}")
    assert (after["status"], after["version"], after["totalCost"]) == (before["status"], before["version"], before["totalCost"])
    offer = coordinator.call("GET", f"/vendor-offers/{bihar['offer']['id']}")
    assert offer["isAvailable"] is True


def test_real_failure_replacement_requires_human_approval(agent_service, scenario, coordinator):
    plan_id = _approved_plan(agent_service, scenario, coordinator)
    bihar = scenario["vendors"]["bihar"]
    event = coordinator.call("POST", "/supplier-failures", {
        "type": "SUPPLIER_UNAVAILABLE", "vendorId": bihar["vendor"]["id"], "planId": plan_id,
        "reason": "Warehouse flooded", "isSimulation": False, "reportedBy": "Test Coordinator"})["event"]
    state = _post(agent_service, "/workflows/replanning", {"plan_id": plan_id, "failure_event_id": event["id"]})
    assert state["status"] == "WAITING_FOR_HUMAN", state
    assert state["attempts"][-1]["outcome"] in ("VALIDATED", "VALIDATED_WITH_WARNINGS")
    assert coordinator.call("GET", f"/procurement/plans/{plan_id}")["status"] == "APPROVED", "original stays in force"

    proposal_id = state["proposal_id"]
    coordinator.call("POST", f"/replanning/proposals/{proposal_id}/approve", {"decidedBy": "Test Coordinator"})
    done = _post(agent_service, f"/workflows/{state['workflow_id']}/resume")
    assert done["status"] == "COMPLETED" and done["checkpoint"] == "proposal_approved", done
    original = coordinator.call("GET", f"/procurement/plans/{plan_id}")
    assert original["status"] == "CANCELLED", "replaced plan kept as history"
    revised = coordinator.call("GET", f"/procurement/plans/{done['results']['decision']['committedPlan']['id']}")
    assert revised["revisionOfId"] == plan_id and float(revised["totalCost"]) == 54000
