"""Procurement workflow: Demand -> Supplier -> Allocation (deterministic optimizer) -> DRAFT plan ->
submit -> WAITING_FOR_HUMAN. Approval and payment remain human actions in the UI."""
from ..agents.allocation_agent import AllocationAgent
from ..agents.demand_agent import DemandAgent
from ..agents.orchestrator import OrchestratorAgent
from ..agents.supplier_agent import SupplierAgent
from .runtime import Runtime
from .state import ProcurementRequest, WorkflowState


async def run_procurement(rt: Runtime, req: ProcurementRequest) -> WorkflowState:
    state = WorkflowState(type="PROCUREMENT", request=req.model_dump(mode="json"))
    await rt.start(state, trigger=req.trigger, emergency_id=req.emergency_id)
    demand_agent, supplier_agent = rt.agent(DemandAgent), rt.agent(SupplierAgent)
    allocation, orchestrator = rt.agent(AllocationAgent), rt.agent(OrchestratorAgent)

    async def body() -> None:
        demand = await demand_agent.run(req.emergency_id)
        state.results["demand"] = demand
        await rt.save(state, "demand_consolidated")
        if demand["totalUnits"] == 0:
            return rt.finish(state, "no_open_demand", "No open NGO requests for this emergency; nothing to procure.")

        state.results["suppliers"] = await supplier_agent.run(req.emergency_id)
        await rt.save(state, "suppliers_compared")

        preview = await allocation.preview(req.emergency_id, req.budget, req.max_delivery_days)
        state.results["optimization"] = preview
        await rt.save(state, "optimized")
        if not preview["feasible"]:
            return rt.finish(state, "infeasible", "The optimizer found no plan that covers all demand within budget and "
                             "constraints. Nothing was saved. Raise the budget, relax delivery time or add supplier capacity.")
        if not req.persist:
            return rt.finish(state, "preview_only", "Preview only; no plan was saved.")

        plan = await allocation.create_draft(req.emergency_id, req.budget, req.max_delivery_days)
        state.plan_id = plan["planId"]
        state.results["plan"] = plan
        await rt.save(state, "draft_created")
        if not req.submit_for_approval:
            return rt.finish(state, "draft_created", "DRAFT plan saved. Submit it for approval when ready.")

        submitted = await allocation.submit(plan["planId"])
        state.results["submission"] = submitted
        status = await orchestrator.plan_status(plan["planId"])
        state.results["approval"] = status
        rt.interrupt(state, "awaiting_plan_approval",
                     "A human coordinator must approve or reject this plan in Approvals. Resume the workflow afterwards.")

    await rt.execute(state, body)
    if req.explain:
        await rt.explain(state, demand_agent, "Explain this procurement workflow outcome to the coordinator.")
    return state


async def resume_procurement(rt: Runtime, state: WorkflowState) -> WorkflowState:
    orchestrator = rt.agent(OrchestratorAgent)

    async def body() -> None:
        status = await orchestrator.plan_status(state.plan_id or "")
        state.results["approval"] = status
        await rt.human_observation(state, "plan_decision", status)
        if status["status"] in ("APPROVED", "ORDERED", "COMPLETED"):
            return rt.finish(state, "plan_approved", "Approved by a human. A coordinator can now start PayPal Sandbox checkout in Payments.")
        if status["status"] in ("REJECTED", "CANCELLED"):
            return rt.finish(state, "plan_rejected", "The plan was rejected or cancelled by a human. No payment can be made for it.")
        rt.interrupt(state, "awaiting_plan_approval", "Still awaiting a human decision.")

    await rt.execute(state, body)
    return state
