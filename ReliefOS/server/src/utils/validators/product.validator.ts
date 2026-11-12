import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(150),
  category: z.string().trim().min(2).max(100),
  unit: z.string().trim().min(1).max(50),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field must be provided" }
  );