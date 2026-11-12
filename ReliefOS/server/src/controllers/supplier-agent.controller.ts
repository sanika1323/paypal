
import type { Request, Response } from "express";
import { z } from "zod";

import {
  runSupplierAgent,
} from "../services/procurement/supplier-agent.service.js";

const supplierSchema = z.object({
  emergencyId: z.string().min(1),
});

export const runSupplierAgentController = async (
  req: Request,
  res: Response
) => {
  const validation = supplierSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid supplier agent input",
      errors: validation.error.issues,
    });
  }

  try {
    const result = await runSupplierAgent(validation.data);

    return res.status(200).json({
      success: true,
      message: "Supplier Agent completed successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        EMERGENCY_NOT_FOUND: "Emergency not found",
        EMERGENCY_INACTIVE: "Cannot evaluate suppliers for an inactive emergency",
        NO_ELIGIBLE_REQUESTS: "No eligible NGO requests found",
      };

      if (messages[error.message]) {
        return res.status(400).json({
          success: false,
          message: messages[error.message],
        });
      }
    }

    console.error("Supplier Agent error:", error);

    return res.status(500).json({
      success: false,
      message: "Supplier Agent execution failed",
    });
  }
};
