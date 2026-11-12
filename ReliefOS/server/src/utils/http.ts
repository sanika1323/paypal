import type { Response } from "express";
import type { ZodError } from "zod";

/** Structured errors: { success:false, code, message }. One table for the newer modules. */
const ERRORS: Record<string, { status: number; message: string }> = {
  NOT_FOUND: { status: 404, message: "Not found" },
  PLAN_NOT_FOUND: { status: 404, message: "Procurement plan not found" },
  PROPOSAL_NOT_FOUND: { status: 404, message: "Replanning proposal not found" },
  FAILURE_EVENT_NOT_FOUND: { status: 404, message: "Supplier failure event not found" },
  VENDOR_NOT_FOUND: { status: 404, message: "Vendor not found" },
  DELIVERY_NOT_FOUND: { status: 404, message: "Delivery not found" },
  PAYMENT_NOT_FOUND: { status: 404, message: "Payment not found" },
  WORKFLOW_NOT_FOUND: { status: 404, message: "Agent workflow not found" },
  EMERGENCY_NOT_FOUND: { status: 404, message: "Emergency not found" },
  EMERGENCY_INACTIVE: { status: 400, message: "The emergency is inactive" },
  NO_ELIGIBLE_REQUESTS: { status: 400, message: "No eligible NGO requests found" },
  DEMAND_REQUEST_NOT_FOUND: { status: 400, message: "A demand line references an unknown relief request" },
  INVALID_DEMAND_QUANTITY: { status: 400, message: "Demand quantities must be positive integers" },
  AGENTS_MAY_ONLY_SIMULATE: { status: 403, message: "Agents may only report simulated failures; real failures need a coordinator" },
  WHAT_IF_MUST_BE_SIMULATION: { status: 400, message: "A what-if scenario must be a simulation" },
  OFFER_NOT_FROM_VENDOR: { status: 400, message: "The offer does not belong to this vendor" },
  DELIVERY_NOT_FROM_VENDOR: { status: 400, message: "The delivery is not supplied by this vendor" },
  OFFER_REQUIRED_FOR_THIS_FAILURE: { status: 400, message: "This failure type requires a vendor offer" },
  REPORTED_CAPACITY_REQUIRED: { status: 400, message: "Reported capacity is required" },
  REPORTED_PRICE_REQUIRED: { status: 400, message: "Reported unit price is required" },
  DELIVERY_REQUIRED_FOR_DELAY: { status: 400, message: "A delivery is required for a delay report" },
  PAYMENT_IN_PROGRESS: { status: 409, message: "A PayPal payment for this plan is in progress; resolve it first" },
  PLAN_NOT_REPLANNABLE: { status: 409, message: "This plan's state does not allow replanning" },
  SCENARIO_OVERRIDES_REQUIRE_SIMULATION: { status: 400, message: "Scenario overrides are only allowed for simulations" },
  NO_EVIDENCED_SHORTFALL: { status: 409, message: "No failed or short-delivered quantity is recorded for this paid plan" },
  NO_DEMAND_IN_PLAN: { status: 409, message: "The plan has no allocated demand to replan" },
  BUDGET_REQUIRED: { status: 400, message: "No remaining budget; provide a budget for the amendment" },
  PROPOSAL_ALREADY_DECIDED: { status: 409, message: "The proposal has already been decided" },
  PROPOSAL_NOT_VALIDATED: { status: 409, message: "Only a validated proposal can be submitted for approval" },
  SIMULATION_CANNOT_BE_SUBMITTED: { status: 409, message: "Simulations are for comparison only and cannot be submitted" },
  SIMULATION_CANNOT_BE_COMMITTED: { status: 409, message: "Simulations cannot be committed" },
  PROPOSAL_NOT_PENDING: { status: 409, message: "The proposal is not awaiting approval" },
  PROPOSAL_NO_LONGER_VALID: { status: 409, message: "Fresh revalidation at approval time failed; the proposal was not committed" },
  PLAN_VERSION_CONFLICT: { status: 409, message: "The source plan changed concurrently; nothing was committed" },
  REJECTION_REASON_REQUIRED: { status: 400, message: "A rejection reason is required" },
  INVALID_DELIVERY_TRANSITION: { status: 409, message: "That status change is not allowed for this delivery" },
  REASON_REQUIRED: { status: 400, message: "A reason is required" },
  INVALID_DISPATCHED_QUANTITY: { status: 400, message: "Dispatched quantity must be between 1 and the shipment quantity" },
  DELIVERY_NOT_IN_TRANSIT: { status: 409, message: "Only a dispatched, in-transit or delayed delivery can be received" },
  INVALID_DELIVERED_QUANTITY: { status: 400, message: "Delivered quantity must be between 0 and the dispatched quantity" },
  RECEIVER_REQUIRED: { status: 400, message: "The receiving person is required" },
  PAYMENT_NOT_COMPLETED: { status: 409, message: "The payment has not been captured" },
  NO_DELIVERABLE_ALLOCATIONS: { status: 409, message: "The plan has no deliverable allocations" },
  WORKFLOW_STEP_CONFLICT: { status: 409, message: "Concurrent step write; retry" },
};

export const sendError = (res: Response, error: unknown, fallback: string) => {
  const code = error instanceof Error ? error.message : "";
  const known = ERRORS[code];
  if (known) return res.status(known.status).json({ success: false, code, message: known.message });
  console.error(fallback, error);
  return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: fallback });
};

export const sendValidationError = (res: Response, error: ZodError, message = "Invalid input") =>
  res.status(400).json({ success: false, code: "VALIDATION_FAILED", message, errors: error.issues });
