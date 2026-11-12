import { z } from "zod";

export const createVendorSchema = z.object({
  name: z.string().trim().min(2).max(150),
  location: z.string().trim().min(2).max(200),
  email: z.string().trim().email().optional(),
  reliability: z.number().min(0).max(1).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const updateVendorSchema = createVendorSchema
  .partial()
  .refine(
    (data) => Object.values(data).some(
      (value) => value !== undefined
    ),
    {
      message: "At least one field must be provided",
    }
  );

const priceSchema = z
  .union([z.string(), z.number()])
  .transform(String)
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(value),
    "Price must have at most two decimal places"
  )
  .refine(
    (value) => Number(value) > 0,
    "Price must be greater than zero"
  );

export const createVendorOfferSchema = z.object({
  vendorId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  unitPrice: priceSchema,
  capacity: z.number().int().positive(),
  deliveryDays: z.number().int().min(0),
  validUntil: z.coerce.date().nullable().optional(),
});

export const updateVendorOfferSchema = z
  .object({
    unitPrice: priceSchema.optional(),
    capacity: z.number().int().nonnegative().optional(), // 0 = supplier reports no availability (triggers revalidation)
    deliveryDays: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
    validUntil: z.coerce.date().nullable().optional(),
  })
  .refine(
    (data) => Object.values(data).some(
      (value) => value !== undefined
    ),
    {
      message: "At least one field must be provided",
    }
  );