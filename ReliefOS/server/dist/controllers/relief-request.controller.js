import { createReliefRequest, getAllReliefRequests, getReliefRequestById, updateReliefRequest, } from "../services/relief-request.service.js";
import { createReliefRequestSchema, updateReliefRequestSchema, } from "../utils/validators/relief-request.validator.js";
const getId = (req) => {
    const id = req.params.id;
    return typeof id === "string" && id.trim()
        ? id
        : null;
};
const getQueryString = (value) => {
    return typeof value === "string" && value.trim()
        ? value.trim()
        : undefined;
};
const getErrorCode = (error) => {
    if (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string") {
        return error.code;
    }
    return null;
};
export const createReliefRequestController = async (req, res) => {
    const validation = createReliefRequestSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid relief request data",
            errors: validation.error.issues,
        });
    }
    try {
        const reliefRequest = await createReliefRequest(validation.data);
        return res.status(201).json({
            success: true,
            message: "Relief request submitted successfully",
            data: reliefRequest,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const messages = {
                ORGANIZATION_NOT_FOUND: "Organization not found",
                ORGANIZATION_NOT_NGO: "Only registered NGOs can submit relief requests",
                EMERGENCY_NOT_FOUND: "Emergency not found",
                EMERGENCY_INACTIVE: "Cannot submit a request for an inactive emergency",
                PRODUCT_NOT_FOUND: "Product not found",
            };
            if (messages[error.message]) {
                return res.status(400).json({
                    success: false,
                    message: messages[error.message],
                });
            }
        }
        if (getErrorCode(error) === "P2003") {
            return res.status(400).json({
                success: false,
                message: "Invalid organization, emergency or product reference",
            });
        }
        console.error("Create relief request error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit relief request",
        });
    }
};
export const getAllReliefRequestsController = async (req, res) => {
    const filters = {
        organizationId: getQueryString(req.query.organizationId),
        emergencyId: getQueryString(req.query.emergencyId),
        status: getQueryString(req.query.status),
    };
    const allowedStatuses = [
        "PENDING",
        "VERIFIED",
        "CONSOLIDATED",
        "APPROVED",
        "FULFILLED",
        "REJECTED",
    ];
    if (filters.status &&
        !allowedStatuses.includes(filters.status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid relief request status",
        });
    }
    try {
        const requests = await getAllReliefRequests({
            organizationId: filters.organizationId,
            emergencyId: filters.emergencyId,
            status: filters.status,
        });
        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests,
        });
    }
    catch (error) {
        console.error("Get relief requests error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve relief requests",
        });
    }
};
export const getReliefRequestByIdController = async (req, res) => {
    const id = getId(req);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid relief request ID",
        });
    }
    try {
        const reliefRequest = await getReliefRequestById(id);
        if (!reliefRequest) {
            return res.status(404).json({
                success: false,
                message: "Relief request not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: reliefRequest,
        });
    }
    catch (error) {
        console.error("Get relief request error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve relief request",
        });
    }
};
export const updateReliefRequestController = async (req, res) => {
    const id = getId(req);
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Invalid relief request ID",
        });
    }
    const validation = updateReliefRequestSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid relief request update data",
            errors: validation.error.issues,
        });
    }
    try {
        const reliefRequest = await updateReliefRequest(id, validation.data);
        return res.status(200).json({
            success: true,
            message: "Relief request updated successfully",
            data: reliefRequest,
        });
    }
    catch (error) {
        if (getErrorCode(error) === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Relief request not found",
            });
        }
        console.error("Update relief request error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update relief request",
        });
    }
};
//# sourceMappingURL=relief-request.controller.js.map