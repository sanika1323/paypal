import { z } from "zod";
import { optimizeProcurement, } from "../services/procurement/procurement-optimizer.service.js";
import { createProcurementPlan, getAllProcurementPlans, getProcurementPlanById, } from "../services/procurement/procurement-plan.service.js";
const optimizeSchema = z.object({
    emergencyId: z.string().min(1),
    budget: z.coerce.number().positive().finite(),
    maxDeliveryDays: z.coerce.number().int().positive().optional(),
});
export const optimizeProcurementController = async (req, res) => {
    const validation = optimizeSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid procurement optimization input",
            errors: validation.error.issues,
        });
    }
    try {
        const result = await optimizeProcurement(validation.data);
        return res.status(200).json({
            success: true,
            message: result.feasible
                ? "Procurement optimization completed successfully"
                : "Optimization completed, but one or more constraints cannot be satisfied",
            data: result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const messages = {
                EMERGENCY_NOT_FOUND: "Emergency not found",
                EMERGENCY_INACTIVE: "Cannot optimize an inactive emergency",
                NO_ELIGIBLE_REQUESTS: "No eligible NGO requests found for this emergency",
                INVALID_OFFER_PRICE: "A supplier offer contains an invalid unit price",
            };
            if (messages[error.message]) {
                return res.status(400).json({
                    success: false,
                    message: messages[error.message],
                });
            }
        }
        console.error("Procurement optimization error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to optimize procurement",
        });
    }
};
export const createProcurementPlanController = async (req, res) => {
    const validation = optimizeSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid procurement plan input",
            errors: validation.error.issues,
        });
    }
    try {
        const plan = await createProcurementPlan(validation.data);
        return res.status(201).json({
            success: true,
            message: "Procurement plan saved successfully as DRAFT",
            data: plan,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const messages = {
                EMERGENCY_NOT_FOUND: "Emergency not found",
                EMERGENCY_INACTIVE: "Cannot create a plan for an inactive emergency",
                NO_ELIGIBLE_REQUESTS: "No eligible NGO requests found",
                INVALID_OFFER_PRICE: "A supplier offer contains an invalid unit price",
                BUDGET_EXCEEDED: "The optimized procurement cost exceeds the available budget",
                INSUFFICIENT_SUPPLIER_CAPACITY: "Supplier capacity is insufficient to fulfill all eligible requests",
            };
            if (messages[error.message]) {
                return res.status(400).json({
                    success: false,
                    message: messages[error.message],
                });
            }
        }
        console.error("Create procurement plan error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save procurement plan",
        });
    }
};
export const getAllProcurementPlansController = async (_req, res) => {
    try {
        const plans = await getAllProcurementPlans();
        return res.status(200).json({
            success: true,
            count: plans.length,
            data: plans,
        });
    }
    catch (error) {
        console.error("Get procurement plans error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve procurement plans",
        });
    }
};
export const getProcurementPlanByIdController = async (req, res) => {
    const id = req.params.id;
    if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({
            success: false,
            message: "Invalid procurement plan ID",
        });
    }
    try {
        const plan = await getProcurementPlanById(id);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Procurement plan not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: plan,
        });
    }
    catch (error) {
        console.error("Get procurement plan error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve procurement plan",
        });
    }
};
//# sourceMappingURL=procurement.controller.js.map