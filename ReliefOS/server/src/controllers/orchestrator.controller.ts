import type { Request, Response } from "express";
import { z } from "zod";

import {
  runProcurementOrchestrator,
} from "../services/procurement/orchestrator.service.js";

const orchestratorSchema = z.object({
  emergencyId: z.string().min(1),
  budget: z.coerce.number().positive().finite(),
  maxDeliveryDays: z.coerce.number().int().positive().optional(),
});

export const runOrchestratorController = async (
  req: Request,
  res: Response
) => {
  const validation = orchestratorSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid orchestrator input",
      errors: validation.error.issues,
    });
  }

  try {
    const result = await runProcurementOrchestrator(
      validation.data
    );

    return res.status(
      result.status === "COMPLETED" ? 200 : 207
    ).json({
      success: result.status === "COMPLETED",
      message:
        result.status === "COMPLETED"
          ? "Procurement orchestration completed successfully"
          : "Procurement orchestration completed with partial results",
      data: result,
    });
  } catch (error) {
    console.error("Procurement Orchestrator error:", error);

    return res.status(500).json({
      success: false,
      message: "Procurement orchestration failed",
    });
  }
};