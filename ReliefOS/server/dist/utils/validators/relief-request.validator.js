import { z } from "zod";
export const createReliefRequestSchema = z.object({
    organizationId: z.string().trim().min(1),
    emergencyId: z.string().trim().min(1),
    productId: z.string().trim().min(1),
    quantity: z.number().int().positive(),
    urgency: z.number().int().min(1).max(5).optional(),
    notes: z.string().trim().max(1000).optional(),
});
export const updateReliefRequestSchema = z
    .object({
    quantity: z.number().int().positive().optional(),
    urgency: z.number().int().min(1).max(5).optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    status: z
        .enum([
        "PENDING",
        "VERIFIED",
        "CONSOLIDATED",
        "APPROVED",
        "FULFILLED",
        "REJECTED",
    ])
        .optional(),
})
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
});
//# sourceMappingURL=relief-request.validator.js.map