import type { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../config/database.js";
import { agentAuthRequired, coordinatorAuthRequired, isValidCoordinatorToken } from "../middleware/auth.js";
import {
  confirmDeliveryReceipt,
  deliveryInclude,
  generateDeliveriesForPayment,
  listDeliveries,
  updateDeliveryStatus,
} from "../services/fulfilment/delivery.service.js";
import { processPayPalWebhook, verifyWebhookSignature } from "../services/payment/webhook.service.js";
import { sendError, sendValidationError } from "../utils/http.js";

/* ---------- Auth ---------- */
export const authStatusController = (_req: Request, res: Response) =>
  res.json({ success: true, data: { coordinatorAuthRequired: coordinatorAuthRequired(), agentAuthRequired: agentAuthRequired() } });

export const verifyCoordinatorController = (req: Request, res: Response) => {
  const token = typeof req.body?.token === "string" ? req.body.token : undefined;
  if (!isValidCoordinatorToken(token)) {
    return res.status(401).json({ success: false, code: "INVALID_TOKEN", message: "Invalid coordinator token" });
  }
  return res.json({ success: true, data: { valid: true } });
};

/* ---------- Deliveries ---------- */
const statusEnum = z.enum(["PENDING", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "DELAYED", "FAILED"]);

export const listDeliveriesController = async (req: Request, res: Response) => {
  const planId = typeof req.query.planId === "string" ? req.query.planId : undefined;
  const status = statusEnum.safeParse(req.query.status);
  try {
    const rows = await listDeliveries({ planId, status: status.success ? status.data : undefined });
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve deliveries");
  }
};

/** One delivery with its audit timeline (every persisted status change and receipt). */
export const getDeliveryController = async (req: Request, res: Response) => {
  try {
    const delivery = await prisma.delivery.findUnique({ where: { id: String(req.params.id) }, include: deliveryInclude });
    if (!delivery) return sendError(res, new Error("DELIVERY_NOT_FOUND"), "");
    const timeline = await prisma.auditLog.findMany({
      where: {
        OR: [
          { entityType: "Delivery", entityId: delivery.id },
          { entityType: "SupplierFailureEvent", entityId: { in: delivery.failureEvents.map((f) => f.id) } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
    return res.json({ success: true, data: { delivery, timeline } });
  } catch (error) {
    return sendError(res, error, "Failed to load delivery");
  }
};

export const generateDeliveriesController = async (req: Request, res: Response) => {
  try {
    const result = await generateDeliveriesForPayment(String(req.params.paymentId));
    return res.status(result.created ? 201 : 200).json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error, "Failed to generate deliveries");
  }
};

const updateSchema = z.object({
  status: z.enum(["DISPATCHED", "IN_TRANSIT", "DELAYED", "FAILED"]),
  reason: z.string().trim().max(500).optional(),
  dispatchedQuantity: z.number().int().positive().optional(),
  updatedBy: z.string().trim().min(1).max(120),
});

export const updateDeliveryController = async (req: Request, res: Response) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, "Invalid delivery update");
  try {
    return res.json({ success: true, data: await updateDeliveryStatus({ deliveryId: String(req.params.id), ...parsed.data }) });
  } catch (error) {
    return sendError(res, error, "Failed to update delivery");
  }
};

const receiptSchema = z.object({
  receivedBy: z.string().trim().min(1).max(120),
  deliveredQuantity: z.number().int().min(0),
  notes: z.string().trim().max(1000).optional(),
  confirmedBy: z.string().trim().min(1).max(120),
});

export const confirmReceiptController = async (req: Request, res: Response) => {
  const parsed = receiptSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error, "Invalid receipt");
  try {
    return res.json({ success: true, data: await confirmDeliveryReceipt({ deliveryId: String(req.params.id), ...parsed.data }) });
  } catch (error) {
    return sendError(res, error, "Failed to confirm receipt");
  }
};

/* ---------- Audit ---------- */
export const listAuditLogsController = async (req: Request, res: Response) => {
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200));
  const q = (name: string) => (typeof req.query[name] === "string" && req.query[name] ? String(req.query[name]) : undefined);
  try {
    const rows = await prisma.auditLog.findMany({
      where: {
        ...(q("entityType") && { entityType: q("entityType") }),
        ...(q("entityId") && { entityId: q("entityId") }),
        ...(q("action") && { action: { startsWith: q("action") } }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve audit logs");
  }
};

/* ---------- PayPal webhook ---------- */
export const paypalWebhookController = async (req: Request, res: Response) => {
  try {
    const valid = await verifyWebhookSignature(req.headers, req.body);
    if (!valid) {
      await prisma.auditLog.create({
        data: {
          action: "PAYPAL_WEBHOOK_REJECTED",
          entityType: "PayPalWebhookEvent",
          entityId: typeof req.body?.id === "string" ? req.body.id : "unknown",
          details: { eventType: req.body?.event_type ?? null, reason: "SIGNATURE_INVALID" },
        },
      });
      return res.status(400).json({ success: false, code: "SIGNATURE_INVALID", message: "Webhook signature verification failed" });
    }
    return res.json({ success: true, data: await processPayPalWebhook(req.body) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "PAYPAL_WEBHOOK_ID_MISSING") {
      return res.status(503).json({ success: false, code, message: "PAYPAL_WEBHOOK_ID is not configured" });
    }
    return sendError(res, error, "Webhook processing failed");
  }
};
