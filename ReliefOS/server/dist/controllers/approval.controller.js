import { z } from "zod";
import { submitProcurementPlanForApproval, getPendingApprovals, decideProcurementApproval, } from "../services/procurement/approval.service.js";
const decisionSchema = z.object({
    approvedBy: z.string().trim().min(1),
    comments: z.string().optional(),
});
const getId = (value) => {
    return typeof value === "string" && value.trim()
        ? value.trim()
        : null;
};
const handleApprovalError = (error, res, fallbackMessage) => {
    if (error instanceof Error) {
        const errors = {
            PLAN_NOT_FOUND: {
                status: 404,
                message: "Procurement plan not found",
            },
            PLAN_NOT_ELIGIBLE_FOR_APPROVAL: {
                status: 400,
                message: "Only draft or analyzing plans can be submitted",
            },
            APPROVAL_ALREADY_EXISTS: {
                status: 409,
                message: "An approval request already exists for this plan",
            },
            APPROVAL_NOT_FOUND: {
                status: 404,
                message: "Approval request not found",
            },
            APPROVAL_NOT_PENDING: {
                status: 409,
                message: "This approval request has already been decided",
            },
            REJECTION_REASON_REQUIRED: {
                status: 400,
                message: "A rejection reason is required",
            },
        };
        const knownError = errors[error.message];
        if (knownError) {
            return res.status(knownError.status).json({
                success: false,
                message: knownError.message,
            });
        }
    }
    console.error(fallbackMessage, error);
    return res.status(500).json({
        success: false,
        message: fallbackMessage,
    });
};
export const submitPlanForApprovalController = async (req, res) => {
    const planId = getId(req.params.id);
    if (!planId) {
        return res.status(400).json({
            success: false,
            message: "Invalid procurement plan ID",
        });
    }
    try {
        const plan = await submitProcurementPlanForApproval(planId);
        return res.status(200).json({
            success: true,
            message: "Procurement plan submitted for human approval",
            data: plan,
        });
    }
    catch (error) {
        return handleApprovalError(error, res, "Failed to submit procurement plan for approval");
    }
};
export const getPendingApprovalsController = async (_req, res) => {
    try {
        const approvals = await getPendingApprovals();
        return res.status(200).json({
            success: true,
            count: approvals.length,
            data: approvals,
        });
    }
    catch (error) {
        return handleApprovalError(error, res, "Failed to retrieve pending approvals");
    }
};
export const approveProcurementPlanController = async (req, res) => {
    const approvalId = getId(req.params.id);
    const validation = decisionSchema.safeParse(req.body);
    if (!approvalId) {
        return res.status(400).json({
            success: false,
            message: "Invalid approval ID",
        });
    }
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid approval input",
            errors: validation.error.issues,
        });
    }
    try {
        const result = await decideProcurementApproval({
            approvalId,
            approvedBy: validation.data.approvedBy,
            comments: validation.data.comments,
            approved: true,
        });
        return res.status(200).json({
            success: true,
            message: "Procurement plan approved successfully",
            data: result,
        });
    }
    catch (error) {
        return handleApprovalError(error, res, "Failed to approve procurement plan");
    }
};
export const rejectProcurementPlanController = async (req, res) => {
    const approvalId = getId(req.params.id);
    const validation = decisionSchema.safeParse(req.body);
    if (!approvalId) {
        return res.status(400).json({
            success: false,
            message: "Invalid approval ID",
        });
    }
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid rejection input",
            errors: validation.error.issues,
        });
    }
    if (!validation.data.comments?.trim()) {
        return res.status(400).json({
            success: false,
            message: "A rejection reason is required",
        });
    }
    try {
        const result = await decideProcurementApproval({
            approvalId,
            approvedBy: validation.data.approvedBy,
            comments: validation.data.comments,
            approved: false,
        });
        return res.status(200).json({
            success: true,
            message: "Procurement plan rejected",
            data: result,
        });
    }
    catch (error) {
        return handleApprovalError(error, res, "Failed to reject procurement plan");
    }
};
//# sourceMappingURL=approval.controller.js.map