"""Reusable MCP prompts. They steer explanation, never the numbers, which come from tools."""
from .server import mcp


@mcp.prompt(name="procurement-analysis", title="Analyse an emergency's procurement")
def procurement_analysis(emergency_id: str, budget: str) -> str:
    return (
        f"Analyse procurement for emergency {emergency_id} with a budget of INR {budget}.\n"
        "1. Call consolidate_emergency_demand and report duplicate or conflicting requests.\n"
        "2. Call compare_supplier_offers and note unusable offers and supplier risk.\n"
        "3. Call optimize_procurement_plan. Quote its figures exactly; do not adjust them.\n"
        "4. If feasible and the user asks, create_procurement_plan_draft and submit_plan_for_approval.\n"
        "Never claim a plan is approved or paid: those are human actions."
    )


@mcp.prompt(name="supplier-failure-recovery", title="Recover from a supplier failure")
def supplier_failure_recovery(plan_id: str, failure_event_id: str) -> str:
    return (
        f"A supplier failure ({failure_event_id}) affects plan {plan_id}.\n"
        "1. get_affected_allocations to see purchases, NGOs and deliveries hit and the suggested mode.\n"
        "2. find_alternative_suppliers for the emergency, excluding the failed supplier.\n"
        "3. generate_replanning_proposal. A paid plan gets an AMENDMENT; an unpaid plan a REPLACEMENT.\n"
        "4. Hand the proposal to the Revalidation Agent. Do not submit it unless validation passed.\n"
        "State clearly that the original plan stays in force until a coordinator approves the proposal."
    )


@mcp.prompt(name="proposal-revalidation", title="Independently revalidate a proposal")
def proposal_revalidation(proposal_id: str) -> str:
    return (
        f"Independently revalidate replanning proposal {proposal_id}. Do not trust the proposal's own claims.\n"
        "Call validate_plan_version, validate_supplier_availability and validate_budget_and_capacity, then\n"
        "validate_revised_plan with your outcome and checks. Report the server's outcome verbatim; if it\n"
        "differs from yours the proposal goes to human review."
    )


@mcp.prompt(name="supplier-risk-explanation", title="Explain supplier risk")
def supplier_risk_explanation(vendor_name: str) -> str:
    return (
        f"Explain the risk profile of supplier '{vendor_name}' using get_supplier_risk_metrics only.\n"
        "Distinguish real failures from simulations and say when a supplier is unrated rather than reliable."
    )
