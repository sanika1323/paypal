import type { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../config/database.js";
import type { Prisma } from "../generated/prisma/client.js";
import { sendError, sendValidationError } from "../utils/http.js";

/** Persistence for the Python agent service: workflow state, checkpoints and step traces. */

const json = (v: unknown) => JSON.parse(JSON.stringify(v ?? null)) as Prisma.InputJsonValue;
const STATUS = ["RUNNING", "WAITING_FOR_HUMAN", "COMPLETED", "FAILED"] as const;
const KINDS = ["AI_REASONING", "MCP_TOOL", "DETERMINISTIC", "PERSISTED_MUTATION", "SIMULATION", "HUMAN_ACTION"] as const;

const createSchema = z.object({
  type: z.string().trim().min(1).max(60),
  trigger: z.string().trim().min(1).max(200),
  emergencyId: z.string().optional(),
  planId: z.string().optional(),
  proposalId: z.string().optional(),
  failureEventId: z.string().optional(),
  isSimulation: z.boolean().optional(),
  state: z.record(z.string(), z.unknown()),
});

export const createWorkflowController = async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  try {
    const wf = await prisma.agentWorkflow.create({ data: { ...parsed.data, state: json(parsed.data.state) } });
    return res.status(201).json({ success: true, data: wf });
  } catch (error) {
    return sendError(res, error, "Failed to create workflow");
  }
};

const updateSchema = z.object({
  status: z.enum(STATUS).optional(),
  state: z.record(z.string(), z.unknown()).optional(),
  checkpoint: z.string().max(120).optional(),
  error: z.string().max(4000).nullable().optional(),
  planId: z.string().optional(),
  proposalId: z.string().optional(),
});

export const updateWorkflowController = async (req: Request, res: Response) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  try {
    const exists = await prisma.agentWorkflow.findUnique({ where: { id: String(req.params.id) } });
    if (!exists) return sendError(res, new Error("WORKFLOW_NOT_FOUND"), "");
    const { state, ...rest } = parsed.data;
    const wf = await prisma.agentWorkflow.update({
      where: { id: exists.id },
      data: { ...rest, ...(state && { state: json(state) }) },
    });
    return res.json({ success: true, data: wf });
  } catch (error) {
    return sendError(res, error, "Failed to update workflow");
  }
};

const stepSchema = z.object({
  agent: z.string().trim().min(1).max(60),
  kind: z.enum(KINDS),
  tool: z.string().max(120).optional(),
  status: z.string().max(40),
  inputSummary: z.unknown().optional(),
  outputSummary: z.unknown().optional(),
  error: z.string().max(4000).optional(),
  attempt: z.number().int().positive().optional(),
  correlationId: z.string().max(120).optional(),
  startedAt: z.coerce.date(),
  durationMs: z.number().int().min(0),
});

export const appendStepController = async (req: Request, res: Response) => {
  const parsed = stepSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const workflowId = String(req.params.id);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const step = await prisma.$transaction(async (tx) => {
        const wf = await tx.agentWorkflow.findUnique({ where: { id: workflowId } });
        if (!wf) throw new Error("WORKFLOW_NOT_FOUND");
        const sequence = (await tx.agentStep.count({ where: { workflowId } })) + 1;
        return tx.agentStep.create({
          data: {
            ...parsed.data,
            workflowId,
            sequence,
            inputSummary: parsed.data.inputSummary === undefined ? undefined : json(parsed.data.inputSummary),
            outputSummary: parsed.data.outputSummary === undefined ? undefined : json(parsed.data.outputSummary),
          },
        });
      });
      return res.status(201).json({ success: true, data: step });
    } catch (error) {
      const unique = typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002";
      if (unique && attempt < 2) continue;
      return sendError(res, unique ? new Error("WORKFLOW_STEP_CONFLICT") : error, "Failed to record step");
    }
  }
  return sendError(res, new Error("WORKFLOW_STEP_CONFLICT"), "");
};

export const listWorkflowsController = async (req: Request, res: Response) => {
  const q = (k: string) => (typeof req.query[k] === "string" && req.query[k] ? String(req.query[k]) : undefined);
  try {
    const data = await prisma.agentWorkflow.findMany({
      where: { ...(q("emergencyId") && { emergencyId: q("emergencyId") }), ...(q("type") && { type: q("type") }), ...(q("planId") && { planId: q("planId") }) },
      orderBy: { createdAt: "desc" },
      take: Math.min(200, Number(req.query.limit) || 50),
      include: { _count: { select: { steps: true } } },
    });
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return sendError(res, error, "Failed to list workflows");
  }
};

export const getWorkflowController = async (req: Request, res: Response) => {
  try {
    const data = await prisma.agentWorkflow.findUnique({
      where: { id: String(req.params.id) },
      include: { steps: { orderBy: { sequence: "asc" } } },
    });
    if (!data) return sendError(res, new Error("WORKFLOW_NOT_FOUND"), "");
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error, "Failed to load workflow");
  }
};
