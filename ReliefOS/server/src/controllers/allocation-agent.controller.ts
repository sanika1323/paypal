
import type { Request, Response } from "express";
import { z } from "zod";

import {
  runAllocationAgent,
} from "../services/procurement/allocation-agent.service.js";

const allocationSchema = z.object({
  emergencyId: z.string().min(1),
  budget: z.coerce.number().positive().finite(),
  maxDeliveryDays: z.coerce.number().int().positive().optional(),
});

export const runAllocationAgentController = async (
  req: Request,
  res: Response
) => {
  const validation = allocationSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid allocation agent input",
      errors: validation.error.issues,
    });
  }

  try {
    const result = await runAllocationAgent(validation.data);

    return res.status(200).json({
      success: true,
      message: result.allocation.feasible
        ? "Allocation Agent completed successfully"
        : "Allocation analysis completed with unmet constraints",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        EMERGENCY_NOT_FOUND: "Emergency not found",
        EMERGENCY_INACTIVE: "Cannot allocate for an inactive emergency",
        NO_ELIGIBLE_REQUESTS: "No eligible NGO requests found",
        INVALID_OFFER_PRICE: "A supplier offer contains an invalid unit price",
      };

      if (messages[error.message]) {
        return res.status(400).json({
          success: false,
          message: messages[error.message],
        });
      }
    }

    console.error("Allocation Agent error:", error);

    return res.status(500).json({
      success: false,
      message: "Allocation Agent execution failed",
    });
  }
};
