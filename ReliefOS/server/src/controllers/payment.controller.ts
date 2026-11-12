import type { Request, Response } from "express";

import {
  createProcurementPayPalOrder,
  getProcurementPayment,
  captureProcurementPayPalOrder,
  verifyProcurementPayPalOrder,
  reconcileMissingPayPalOrder,
} from "../services/payment/paypal.service.js";


const getRouteId = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return null;
};

const handlePaymentError = (
  error: unknown,
  res: Response
) => {
  const message =
    error instanceof Error ? error.message : "UNKNOWN_ERROR";

  const statusMap: Record<string, number> = {
    PLAN_NOT_FOUND: 404,
    PAYMENT_NOT_FOUND: 404,
    PLAN_NOT_APPROVED: 409,
    INVALID_PROCUREMENT_AMOUNT: 400,
    PAYMENT_ALREADY_EXISTS: 409,
    PAYMENT_NOT_READY_FOR_CAPTURE: 409,
    PAYMENT_CAPTURE_ALREADY_IN_PROGRESS: 409,
    INVALID_PAYMENT_CURRENCY: 400,
    PAYPAL_ORDER_ID_MISSING: 409,
    PAYPAL_ORDER_VALIDATION_FAILED: 409,
    PAYPAL_ORDER_VERIFICATION_FAILED: 502,
    PAYPAL_CAPTURE_FAILED_RECONCILIATION_REQUIRED: 502,
    PAYPAL_CAPTURE_VALIDATION_FAILED: 502,
    PAYPAL_CREDENTIALS_MISSING: 500,
    PAYPAL_AUTHENTICATION_FAILED: 502,
    PAYPAL_CURRENCY_MUST_BE_USD: 500,
    PAYPAL_RETURN_URLS_MISSING: 500,
    EXCHANGE_RATE_UNAVAILABLE: 502,
    INVALID_EXCHANGE_RATE_RESPONSE: 502,
    CONVERTED_AMOUNT_TOO_SMALL: 400,
PAYMENT_NOT_ELIGIBLE_FOR_RECONCILIATION: 409,
PAYMENT_ALREADY_CAPTURED: 409,
PAYMENT_CHANGED_DURING_RECONCILIATION: 409,
PAYPAL_ORDER_STILL_EXISTS: 409,
PAYPAL_ORDER_RECONCILIATION_VERIFICATION_FAILED: 502,
    INVALID_PAYPAL_RETURN_URLS: 500,
    PAYMENT_NOT_RESUMABLE: 409,
    PAYMENT_AMOUNT_CHANGED: 409,
    PAYPAL_ORDER_CREATION_AMBIGUOUS: 502,
    PAYPAL_EXISTING_ORDER_LOOKUP_FAILED: 502,
    PAYPAL_APPROVAL_URL_MISSING: 502,
    PAYPAL_ORDER_ALREADY_APPROVED: 409,
    PAYPAL_ORDER_REQUIRES_RECONCILIATION: 409,
  };

  const statusCode = statusMap[message] ?? 500;

  if (statusCode >= 500) {
    console.error("Payment operation failed:", error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const createPaymentCheckoutController = async (
  req: Request,
  res: Response
) => {
  try {
    const planId = getRouteId(req.params.planId);

if (!planId) {
      return res.status(400).json({
        success: false,
        message: "PLAN_ID_REQUIRED",
      });
    }

    const result = await createProcurementPayPalOrder(planId);

    return res.status(201).json({
      success: true,
      message: "PayPal checkout order created successfully",
      data: result,
    });
  } catch (error) {
    return handlePaymentError(error, res);
  }
};

export const getPaymentController = async (
  req: Request,
  res: Response
) => {
  try {
    const paymentId = getRouteId(req.params.paymentId);

if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "PAYMENT_ID_REQUIRED",
      });
    }

    const payment = await getProcurementPayment(paymentId);

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return handlePaymentError(error, res);
  }
};

export const capturePaymentController = async (
  req: Request,
  res: Response
) => {
  try {
   const paymentId = getRouteId(req.params.paymentId);

if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "PAYMENT_ID_REQUIRED",
      });
    }

    const result =
      await captureProcurementPayPalOrder(paymentId);

    return res.status(200).json({
      success: true,
      message: result.alreadyCompleted
        ? "Payment was already completed"
        : "PayPal payment captured successfully",
      data: result,
    });
  } catch (error) {
    return handlePaymentError(error, res);
  }
};

export const verifyPaymentOrderController = async (
  req: Request,
  res: Response
) => {
  try {
    const paymentId = getRouteId(req.params.paymentId);

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "PAYMENT_ID_REQUIRED",
      });
    }

    const result = await verifyProcurementPayPalOrder(paymentId);

    return res.status(200).json({
      success: true,
      message: "PayPal order verification completed",
      data: result,
    });
  } catch (error) {
    return handlePaymentError(error, res);
  }
};

export const reconcileMissingPayPalOrderController = async (
  req: Request,
  res: Response
) => {
  try {
    const paymentId = getRouteId(req.params.paymentId);

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "PAYMENT_ID_REQUIRED",
      });
    }

    const result =
      await reconcileMissingPayPalOrder(paymentId);

    return res.status(200).json({
      success: true,
      message: "Missing PayPal order reconciled successfully",
      data: result,
    });
  } catch (error) {
    return handlePaymentError(error, res);
  }
};