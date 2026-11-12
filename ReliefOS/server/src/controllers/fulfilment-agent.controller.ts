
import type { Request, Response } from "express";
import { z } from "zod";

import {
  runFulfilmentAgent,
} from "../services/procurement/fulfilment-agent.service.js";

const fulfilmentSchema = z.object({
  emergencyId: z.string().min(1),
});

export const runFulfilmentAgentController = async (
  req: Request,
  res: Response
) => {
  const validation = fulfilmentSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid fulfilment agent input",
      errors: validation.error.issues,
    });
  }

  try {
    const result = await runFulfilmentAgent(validation.data);

    return res.status(200).json({
      success: true,
      message: "Fulfilment Agent completed successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        EMERGENCY_NOT_FOUND: "Emergency not found",
      };

      if (messages[error.message]) {
        return res.status(404).json({
          success: false,
          message: messages[error.message],
        });
      }
    }

    console.error("Fulfilment Agent error:", error);

    return res.status(500).json({
      success: false,
      message: "Fulfilment Agent execution failed",
    });
  }
};
