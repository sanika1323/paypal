"""Replanning workflow (supplier failure -> independent revalidation -> human decision).

failure (reported by a coordinator, or SIMULATED by the agent)
  -> affected records -> alternatives -> proposal -> Revalidation Agent (+ server recompute)
  -> stale / version-conflict rejection: regenerate from fresh data (bounded attempts)
  -> infeasible: stop; the original plan stays in force
  -> validated (real): handed to humans, WAITING_FOR_HUMAN
  -> validated (simulation): report only; simulations can never be submitted.
"""
from ..agents.orchestrator import OrchestratorAgent
from ..agents.replanning_agent import ReplanningAgent
from ..agents.revalidation_agent import RevalidationAgent
from .runtime import Runtime
from .state import ReplanningRequest, WorkflowState

RETRYABLE = {"REJECTED_STALE_DATA", "REJECTED_VERSION_CONFLICT"}
PASSING = {"VALIDATED", "VALIDATED_WITH_WARNINGS"}


async def run_replanning(rt: Runtime, req: ReplanningRequest) -> WorkflowState:
    state = WorkflowState(type="REPLANNING", request=req.model_dump(mode="json"), plan_id=req.plan_id,
                          is_simulation=req.simulation is not None)
    await rt.start(state, trigger=req.trigger, plan_id=req.plan_id, failure_event_id=req.failure_event_id)
    replanner, revalidator, orchestrator = rt.agent(ReplanningAgent), rt.agent(RevalidationAgent), rt.agent(OrchestratorAgent)

    async def body() -> None:
        plan = await orchestrator.plan(req.plan_id)
        state.results["sourcePlan"] = {"id": plan["id"], "status": plan["status"], "version": plan.get("version"), "totalCost": plan["totalCost"]}

        event_id = req.failure_event_id
        if req.simulation:
            event = await replanner.simulate_failure({**req.simulation.model_dump(exclude_none=True), "plan_id": req.plan_id})
            event_id = event["id"]
            state.results["simulatedFailure"] = {"id": event["id"], "type": event["type"], "isSimulation": True}
        await rt.save(state, "failure_recorded")

        affected = await replanner.assess(event_id)
        state.results["affected"] = affected
        mine = next((p for p in affected["affectedPlans"] if p["planId"] == req.plan_id), None)
        if mine is None or mine["affectedQuantity"] == 0:
            await rt.save(state, "impact_assessed")
            return rt.finish(state, "no_impact", "This failure does not affect any undelivered quantity of the plan. No proposal needed.")
        await rt.save(state, "impact_assessed")

        state.results["alternatives"] = await replanner.alternatives(plan["emergencyId"], affected["event"]["vendorId"])
        await rt.save(state, "alternatives_found")

        for attempt in range(1, req.max_attempts + 1):
            proposal = await replanner.propose(req.plan_id, event_id, req.budget, req.max_delivery_days, attempt)
            state.proposal_id = proposal["proposalId"]
            state.is_simulation = state.is_simulation or bool(proposal["isSimulation"])  # e.g. a simulated event id
            await rt.save(state, f"proposal_generated_{attempt}")
            validation = await revalidator.run(proposal["proposalId"])
            state.attempts.append({"attempt": attempt, "proposalId": proposal["proposalId"], "mode": proposal["mode"],
                                   "feasible": proposal["feasible"], "revisedCost": proposal["revisedCost"],
                                   "agentOutcome": validation["agentOutcome"], "serverOutcome": validation["serverOutcome"],
                                   "outcome": validation["outcome"], "reportId": validation["reportId"]})
            state.results["comparison"] = validation["comparison"]
            await rt.save(state, f"revalidated_{attempt}")
            outcome = validation["outcome"]

            if outcome in RETRYABLE and attempt < req.max_attempts:
                continue  # regenerate from fresh data
            if outcome in RETRYABLE:
                return rt.finish(state, "retries_exhausted", "Inputs kept changing during revalidation. The original plan stays in force; retry later.")
            if outcome == "REJECTED_INFEASIBLE":
                return rt.finish(state, "proposal_infeasible", "No feasible revised plan within budget and capacity. The original plan stays in force.")
            if state.is_simulation:
                return rt.finish(state, "simulation_reported", "Simulation only: nothing was changed and the proposal cannot be submitted.")
            if not req.submit_for_approval:
                return rt.finish(state, "proposal_validated", "Proposal validated. Submit it for approval from Replanning when ready.")
            submitted = await orchestrator.hand_to_humans(proposal["proposalId"])
            state.results["submission"] = submitted
            checkpoint = "human_review_required" if outcome == "REQUIRES_HUMAN_REVIEW" else "awaiting_proposal_approval"
            return rt.interrupt(state, checkpoint, "A human coordinator must approve or reject the proposal in Approvals. "
                                "The original plan stays in force until then.")

    await rt.execute(state, body)
    if req.explain:
        await rt.explain(state, replanner, "Explain this supplier-failure replanning outcome, original versus revised plan.")
    return state


async def resume_replanning(rt: Runtime, state: WorkflowState) -> WorkflowState:
    orchestrator = rt.agent(OrchestratorAgent)

    async def body() -> None:
        proposal = await orchestrator.proposal_status(state.plan_id or "", state.proposal_id or "")
        if proposal is None:
            state.status, state.error = "FAILED", {"code": "PROPOSAL_NOT_FOUND", "message": "Proposal no longer exists."}
            return
        observed = {"status": proposal["status"], "committedPlan": proposal.get("committedPlan"), "decidedBy": proposal.get("decidedBy")}
        state.results["decision"] = observed
        await rt.human_observation(state, "proposal_decision", observed)
        if proposal["status"] == "APPROVED":
            committed = proposal.get("committedPlan") or {}
            return rt.finish(state, "proposal_approved", f"Approved by a human. Revised plan {committed.get('id')} is now in force"
                             + (" and needs its own payment." if proposal.get("mode") == "AMENDMENT" else "."))
        if proposal["status"] in ("REJECTED", "SUPERSEDED"):
            return rt.finish(state, "proposal_rejected", "The proposal was rejected or superseded. The original plan stays in force.")
        rt.interrupt(state, state.checkpoint, "Still awaiting a human decision.")

    await rt.execute(state, body)
    return state
