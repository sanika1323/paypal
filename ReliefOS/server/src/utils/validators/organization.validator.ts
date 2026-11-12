
import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(150),
  type: z.enum(["NGO", "GOVERNMENT", "SUPPLIER"]),
  email: z.string().trim().email().max(255),
  location: z.string().trim().max(200).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const updateOrganizationSchema = createOrganizationSchema
  .partial()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field must be provided" }
  );
