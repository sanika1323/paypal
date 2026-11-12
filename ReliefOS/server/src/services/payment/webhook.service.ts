import { prisma } from "../../config/database.js";
import { generateDeliveriesSafely } from "../fulfilment/delivery.service.js";
import { getPayPalAccessToken, getPayPalBaseUrl } from "./paypal.service.js";

/**
 * PayPal webhook handling. Every event is verified with PayPal's
 * /v1/notifications/verify-webhook-signature API against PAYPAL_WEBHOOK_ID before
 * it can change anything, and each event id is processed at most once.
 */

type WebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: { currency_code?: string; value?: string };
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
};

const HEADER_NAMES = {
  auth_algo: "paypal-auth-algo",
  cert_url: "paypal-cert-url",
  transmission_id: "paypal-transmission-id",
  transmission_sig: "paypal-transmission-sig",
  transmission_time: "paypal-transmission-time",
} as const;

export const verifyWebhookSignature = async (
  headers: Record<string, string | string[] | undefined>,
  event: unknown
): Promise<boolean> => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID_MISSING");

  const values: Record<string, string> = {};
  for (const [key, header] of Object.entries(HEADER_NAMES)) {
    const value = headers[header];
    if (typeof value !== "string" || !value) return false;
    values[key] = value;
  }

  const token = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...values, webhook_id: webhookId, webhook_event: event }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("PAYPAL_WEBHOOK_VERIFICATION_FAILED");

  const data = (await response.json()) as { verification_status?: string };
  return data.verification_status === "SUCCESS";
};

export const processPayPalWebhook = async (event: WebhookEvent) => {
  const eventId = event.id;
  const eventType = event.event_type ?? "UNKNOWN";
  if (!eventId) throw new Error("INVALID_WEBHOOK_EVENT");

  const seen = await prisma.auditLog.findFirst({
    where: { action: "PAYPAL_WEBHOOK_RECEIVED", entityId: eventId },
  });
  if (seen) return { eventId, eventType, outcome: "DUPLICATE_IGNORED" };

  const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
  const payment = orderId
    ? await prisma.payment.findUnique({ where: { paypalOrderId: orderId } })
    : null;

  let outcome = "RECORDED";
  let generateFor: string | null = null;

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        action: "PAYPAL_WEBHOOK_RECEIVED",
        entityType: "PayPalWebhookEvent",
        entityId: eventId,
        details: { eventType, orderId: orderId ?? null, paymentId: payment?.id ?? null, resourceStatus: event.resource?.status ?? null },
      },
    });

    if (!payment) {
      outcome = orderId ? "PAYMENT_NOT_FOUND" : "NOT_A_CAPTURE_EVENT";
      return;
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const amount = event.resource?.amount;
      const cents = (value: unknown) => Math.round(Number(value) * 100);
      const matches =
        payment.currency === "USD" &&
        amount?.currency_code === "USD" &&
        typeof amount.value === "string" &&
        Number.isFinite(Number(amount.value)) &&
        cents(amount.value) === cents(payment.amount.toString());
      if (!matches) {
        outcome = "AMOUNT_MISMATCH";
        await tx.auditLog.create({
          data: {
            action: "PAYPAL_WEBHOOK_AMOUNT_MISMATCH",
            entityType: "Payment",
            entityId: payment.id,
            details: { expected: payment.amount.toFixed(2), received: amount?.value ?? null },
          },
        });
        return;
      }
      if (payment.status === "COMPLETED") {
        outcome = "ALREADY_COMPLETED";
        generateFor = payment.id; // still make sure deliveries exist
        return;
      }
      const updated = await tx.payment.updateMany({
        where: { id: payment.id, status: { in: ["PENDING", "APPROVED", "PROCESSING"] } },
        data: { status: "COMPLETED", paypalCaptureId: event.resource?.id ?? null },
      });
      if (updated.count === 1) {
        outcome = "PAYMENT_COMPLETED";
        generateFor = payment.id;
        await tx.auditLog.create({
          data: {
            action: "PAYPAL_PAYMENT_CAPTURED",
            entityType: "Payment",
            entityId: payment.id,
            details: { source: "webhook", eventId, paypalOrderId: orderId, paypalCaptureId: event.resource?.id ?? null },
          },
        });
      } else {
        outcome = `IGNORED_PAYMENT_${payment.status}`;
      }
    } else if (eventType === "PAYMENT.CAPTURE.DENIED" || eventType === "PAYMENT.CAPTURE.DECLINED") {
      const updated = await tx.payment.updateMany({
        where: { id: payment.id, status: { in: ["PENDING", "APPROVED", "PROCESSING"] } },
        data: { status: "FAILED" },
      });
      outcome = updated.count ? "PAYMENT_FAILED" : `IGNORED_PAYMENT_${payment.status}`;
    } else if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
      const updated = await tx.payment.updateMany({
        where: { id: payment.id, status: "COMPLETED" },
        data: { status: "REFUNDED" },
      });
      outcome = updated.count ? "PAYMENT_REFUNDED" : `IGNORED_PAYMENT_${payment.status}`;
    }
  });

  if (generateFor) await generateDeliveriesSafely(generateFor);

  return { eventId, eventType, outcome, paymentId: payment?.id ?? null };
};
