import type { Request, Response } from "express";
import { z } from "zod";

import { principalOf } from "../middleware/auth.js";
import { getAffectedRecords, listSupplierFailures, reportSupplierFailure } from "../services/replanning/failure.service.js";
import {
  decideProposal,
  generateProposal,
  getProposal,
  listProposals,
  recordValidation,
  submitProposalForApproval,
} from "../services/replanning/proposal.service.js";
import { sendError, sendValidationError } from "../utils/http.js";

const FAILURE_TYPES = [
  "ORDER_CANCELLED", "INSUFFICIENT_STOCK", "CAPACITY_REDUCED", "SUPPLIER_UNAVAILABLE",
  "OFFER_EXPIRED", "PRICE_CHANGED", "DELIVERY_DELAYED", "WHAT_IF_SCENARIO",
] as const;
const OUTCOMES = [
  "VALIDATED", "VALIDATED_WITH_WARNINGS", "REJECTED_INFEASIBLE", "REJECTED_STALE_DATA", "REJECTED_VERSION_CONFLICT", "REQUIRES_HUMAN_REVIEW",
] as const;
const price = z.union([z.string(), z.number()]).transform(String).refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, "Invalid price");
const idemKey = (req: Request) => (typeof req.headers["idempotency-key"] === "string" ? req.headers["idempotency-key"].trim() || undefined : undefined);

const failureSchema = z.object({
  type: z.enum(FAILURE_TYPES),
  vendorId: z.string().min(1),
  vendorOfferId: z.string().min(1).optional(),
  planId: z.string().min(1).optional(),
  deliveryId: z.string().min(1).optional(),
  affectedQuantity: z.number().int().positive().optional(),
  reportedCapacity: z.number().int().min(0).optional(),
  reportedUnitPrice: price.optional(),
  reportedDeliveryDays: z.number().int().positive().optional(),
  reason: z.string().trim().min(3).max(1000),
  isSimulation: z.boolean(),
  reportedBy: z.string().trim().min(1).max(120),
});

export const reportFailureController = async (req: Request, res: Response) => {
  const parsed = failureSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, "Invalid supplier failure report");
  const principal = principalOf(res);
  try {
    const result = await reportSupplierFailure(
      { ...parsed.data, idempotencyKey: idemKey(req) },
      principal.role === "agent" ? "agent" : "coordinator"
    );
    return res.status(result.replayed ? 200 : 201).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error, "Failed to record supplier failure");
  }
};

export const listFailuresController = async (req: Request, res: Response) => {
  try {
    const data = await listSupplierFailures({
      vendorId: typeof req.query.vendorId === "string" ? req.query.vendorId : undefined,
      planId: typeof req.query.planId === "string" ? req.query.planId : undefined,
    });
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return sendError(res, error, "Failed to list supplier failures");
  }
};

export const affectedRecordsController = async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: await getAffectedRecords(String(req.params.id)) });
  } catch (error) {
    return sendError(res, error, "Failed to load affected records");
  }
};

const overrideSchema = z.object({
  capacity: z.number().int().min(0).optional(),
  unitPrice: price.optional(),
  deliveryDays: z.number().int().positive().optional(),
  isAvailable: z.boolean().optional(),
});
const proposalSchema = z.object({
  sourcePlanId: z.string().min(1),
  failureEventId: z.string().min(1).optional(),
  budget: z.number().positive().finite().optional(),
  maxDeliveryDays: z.number().int().positive().optional(),
  scenario: z
    .object({ excludeOfferIds: z.array(z.string().min(1)).optional(), offerOverrides: z.record(z.string(), overrideSchema).optional() })
    .optional(),
  rationale: z.string().trim().max(4000).optional(),
  createdBy: z.string().trim().min(1).max(120),
  workflowId: z.string().min(1).optional(),
});

export const createProposalController = async (req: Request, res: Response) => {
  const parsed = proposalSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, "Invalid replanning proposal request");
  try {
    const result = await generateProposal({ ...parsed.data, idempotencyKey: idemKey(req) });
    return res.status(result.replayed ? 200 : 201).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error, "Failed to generate replanning proposal");
  }
};

export const listProposalsController = async (req: Request, res: Response) => {
  try {
    const data = await listProposals({
      sourcePlanId: typeof req.query.sourcePlanId === "string" ? req.query.sourcePlanId : undefined,
      status: typeof req.query.status === "string" ? req.query.status : undefined,
    });
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return sendError(res, error, "Failed to list proposals");
  }
};

export const getProposalController = async (req: Request, res: Response) => {
  try {
    const data = await getProposal(String(req.params.id));
    if (!data) return sendError(res, new Error("PROPOSAL_NOT_FOUND"), "");
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error, "Failed to load proposal");
  }
};

const validationSchema = z.object({
  validator: z.string().trim().min(1).max(120),
  workflowId: z.string().min(1).optional(),
  agentOutcome: z.enum(OUTCOMES).optional(),
  agentChecks: z.array(z.unknown()).max(200).optional(),
});

export const validateProposalController = async (req: Request, res: Response) => {
  const parsed = validationSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, "Invalid validation report");
  try {
    const result = await recordValidation({ proposalId: String(req.params.id), ...parsed.data });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error, "Failed to validate proposal");
  }
};

const submitSchema = z.object({ submittedBy: z.string().trim().min(1).max(120) });

export const submitProposalController = async (req: Request, res: Response) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  try {
    return res.json({ success: true, data: await submitProposalForApproval(String(req.params.id), parsed.data.submittedBy) });
  } catch (error) {
    return sendError(res, error, "Failed to submit proposal");
  }
};

const decisionSchema = z.object({ decidedBy: z.string().trim().min(1).max(120), comment: z.string().trim().max(2000).optional() });

const decide = (approved: boolean) => async (req: Request, res: Response) => {
  const parsed = decisionSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  try {
    const result = await decideProposal({ proposalId: String(req.params.id), approved, ...parsed.data });
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error, approved ? "Failed to approve proposal" : "Failed to reject proposal");
  }
};
export const approveProposalController = decide(true);
export const rejectProposalController = decide(false);
