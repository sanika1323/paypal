import { z } from "zod";
import { runDemandAgent } from "../services/procurement/demand-agent.service.js";
const demandSchema = z.object({
    emergencyId: z.string().min(1),
});
export const runDemandAgentController = async (req, res) => {
    const validation = demandSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid demand agent input",
            errors: validation.error.issues,
        });
    }
    try {
        const result = await runDemandAgent(validation.data);
        return res.status(200).json({
            success: true,
            message: "Demand Agent completed successfully",
            data: result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const messages = {
                EMERGENCY_NOT_FOUND: "Emergency not found",
                EMERGENCY_INACTIVE: "Cannot analyze an inactive emergency",
                NO_ELIGIBLE_REQUESTS: "No eligible NGO requests found",
            };
            if (messages[error.message]) {
                return res.status(400).json({
                    success: false,
                    message: messages[error.message],
                });
            }
        }
        console.error("Demand Agent error:", error);
        return res.status(500).json({
            success: false,
            message: "Demand Agent execution failed",
        });
    }
};
//# sourceMappingURL=demand-agent.controller.js.map