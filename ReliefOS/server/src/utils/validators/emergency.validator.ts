import { z } from "zod";

export const createEmergencySchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().min(2).max(200),
  severity: z.string().trim().min(1).max(50),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const updateEmergencySchema = createEmergencySchema
  .partial()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field must be provided" }
  );

export const emergencyStatusSchema = z.object({
  isActive: z.boolean(),
});