
import { prisma } from "../../config/database.js";
import {
  getInrUsdReferenceRate,
  convertInrToUsd,
} from "./exchange-rate.service.js";

type PayPalTokenResponse = {
  access_token?: unknown;
};

type PayPalOrderResponse = {
  id?: unknown;
  links?: Array<{
    rel?: string;
    href?: string;
  }>;
};

const getPayPalBaseUrl = (): string => {
  const baseUrl =
    process.env.PAYPAL_BASE_URL ||
    "https://api-m.sandbox.paypal.com";

  const parsed = new URL(baseUrl);

  if (parsed.protocol !== "https:") {
    throw new Error("INVALID_PAYPAL_BASE_URL");
  }

  return baseUrl.replace(/\/+$/, "");
};

const getPayPalAccessToken = async (): Promise<string> => {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CREDENTIALS_MISSING");
  }

  if (
    process.env.PAYPAL_CURRENCY &&
    process.env.PAYPAL_CURRENCY.trim().toUpperCase() !== "USD"
  ) {
    throw new Error("PAYPAL_CURRENCY_MUST_BE_USD");
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    throw new Error("PAYPAL_AUTHENTICATION_FAILED");
  }

  const data =
    (await response.json()) as PayPalTokenResponse;

  if (
    typeof data.access_token !== "string" ||
    !data.access_token
  ) {
    throw new Error("PAYPAL_ACCESS_TOKEN_MISSING");
  }

  return data.access_token;
};

export const createProcurementPayPalOrder = async (
  planId: string
) => {
  const returnUrl = process.env.PAYPAL_RETURN_URL?.trim();
  const cancelUrl = process.env.PAYPAL_CANCEL_URL?.trim();

  if (!returnUrl || !cancelUrl) {
    throw new Error("PAYPAL_RETURN_URLS_MISSING");
  }

  // Validate URLs before creating or modifying any payment record.
  try {
    const returnParsed = new URL(returnUrl);
    const cancelParsed = new URL(cancelUrl);

    const isAllowedProtocol = (url: URL) =>
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname));

    if (
      !isAllowedProtocol(returnParsed) ||
      !isAllowedProtocol(cancelParsed)
    ) {
      throw new Error("INVALID_URL");
    }
  } catch {
    throw new Error("INVALID_PAYPAL_RETURN_URLS");
  }

  const plan = await prisma.procurementPlan.findUnique({
    where: { id: planId },
    include: {
      approvals: true,
      payments: true,
    },
  });

  if (!plan) {
    throw new Error("PLAN_NOT_FOUND");
  }

  if (
    plan.status !== "APPROVED" ||
    !plan.approvals.some((approval) => approval.approved)
  ) {
    throw new Error("PLAN_NOT_APPROVED");
  }

  const inrAmount = Number(plan.totalCost.toString());

  if (!Number.isFinite(inrAmount) || inrAmount <= 0) {
    throw new Error("INVALID_PROCUREMENT_AMOUNT");
  }

  const activePayment = plan.payments.find((payment) =>
    ["PENDING", "APPROVED", "PROCESSING", "COMPLETED"].includes(
      payment.status
    )
  );

  let payment: (typeof plan.payments)[number];
  let usdAmount: string;
  let exchangeRate: number;
  let exchangeRateDate: string;
  let exchangeRateProvider: string;
  let accessToken: string;

  if (activePayment) {
    if (activePayment.status !== "PENDING") {
      throw new Error("PAYMENT_ALREADY_EXISTS");
    }

    payment = activePayment;

    // Never change the INR/USD snapshot for an existing payment.
    if (
      !payment.originalAmountINR ||
      !payment.exchangeRate ||
      !payment.exchangeRateDate ||
      !payment.exchangeRateProvider
    ) {
      throw new Error("PAYMENT_NOT_RESUMABLE");
    }

    const savedInrAmount = Number(
      payment.originalAmountINR.toString()
    );

    if (
      !Number.isFinite(savedInrAmount) ||
      Math.abs(savedInrAmount - inrAmount) > 0.001
    ) {
      throw new Error("PAYMENT_AMOUNT_CHANGED");
    }

    usdAmount = payment.amount.toFixed(2);
    exchangeRate = Number(payment.exchangeRate.toString());
    exchangeRateDate = payment.exchangeRateDate;
    exchangeRateProvider = payment.exchangeRateProvider;

    if (
      !Number.isFinite(exchangeRate) ||
      exchangeRate <= 0 ||
      !Number.isFinite(Number(usdAmount)) ||
      Number(usdAmount) <= 0
    ) {
      throw new Error("PAYMENT_NOT_RESUMABLE");
    }

    accessToken = await getPayPalAccessToken();

    // If the order ID was already saved, retrieve that exact order.
    // Do not create another order.
    if (payment.paypalOrderId) {
      const existingOrderResponse = await fetch(
        `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(
          payment.paypalOrderId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(20000),
        }
      );

      if (!existingOrderResponse.ok) {
        throw new Error("PAYPAL_EXISTING_ORDER_LOOKUP_FAILED");
      }

      const existingOrder =
        (await existingOrderResponse.json()) as PayPalOrderDetails;

      const existingPurchaseUnit =
        existingOrder.purchase_units?.[0];

      const existingOrderMatches =
        existingOrder.id === payment.paypalOrderId &&
        existingPurchaseUnit?.reference_id === plan.id &&
        existingPurchaseUnit?.custom_id === payment.id &&
        isMatchingAmount(
          existingPurchaseUnit?.amount,
          usdAmount
        );

      if (!existingOrderMatches) {
        throw new Error("PAYPAL_ORDER_VALIDATION_FAILED");
      }

      if (existingOrder.status === "APPROVED") {
        throw new Error("PAYPAL_ORDER_ALREADY_APPROVED");
      }

      if (existingOrder.status === "COMPLETED") {
        throw new Error("PAYPAL_ORDER_REQUIRES_RECONCILIATION");
      }

      const existingApprovalUrl = existingOrder.links?.find(
        (link) =>
          link.rel === "approve" ||
          link.rel === "payer-action"
      )?.href;

      if (!existingApprovalUrl) {
        throw new Error("PAYPAL_APPROVAL_URL_MISSING");
      }

      return {
        paymentId: payment.id,
        orderId: payment.paypalOrderId,
        approvalUrl: existingApprovalUrl,
        originalAmountINR: savedInrAmount.toFixed(2),
        amountUSD: usdAmount,
        exchangeRate,
        exchangeRateDate,
        exchangeRateProvider,
        currency: "USD",
        resumed: true,
      };
    }
  } else {
    // Only a genuinely new payment gets a new exchange-rate snapshot.
    const exchange = await getInrUsdReferenceRate();

    usdAmount = convertInrToUsd(inrAmount, exchange.rate);
    exchangeRate = exchange.rate;
    exchangeRateDate = exchange.date;
    exchangeRateProvider = exchange.provider;

    accessToken = await getPayPalAccessToken();

    payment = await prisma.$transaction(async (tx) => {
      const currentPlan = await tx.procurementPlan.findUnique({
        where: { id: planId },
        include: {
          approvals: true,
          payments: true,
        },
      });

      if (!currentPlan) {
        throw new Error("PLAN_NOT_FOUND");
      }

      if (
        currentPlan.status !== "APPROVED" ||
        !currentPlan.approvals.some((approval) => approval.approved)
      ) {
        throw new Error("PLAN_NOT_APPROVED");
      }

      if (
        currentPlan.payments.some((existing) =>
          ["PENDING", "APPROVED", "PROCESSING", "COMPLETED"].includes(
            existing.status
          )
        )
      ) {
        throw new Error("PAYMENT_ALREADY_EXISTS");
      }

      return tx.payment.create({
        data: {
          planId,
          amount: usdAmount,
          currency: "USD",
          status: "PENDING",
          originalAmountINR: inrAmount.toFixed(2),
          exchangeRate: exchange.rate.toString(),
          exchangeRateDate: exchange.date,
          exchangeRateProvider: exchange.provider,
        },
      });
    });
  }

  const requestId = `reliefos-order-${payment.id}`;

  let response: Response;

  try {
    response = await fetch(
      `${getPayPalBaseUrl()}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": requestId,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: plan.id,
              custom_id: payment.id,
              description: `ReliefOS procurement - ${plan.name}`,
              amount: {
                currency_code: "USD",
                value: usdAmount,
              },
            },
          ],
          application_context: {
            brand_name: "ReliefOS",
            user_action: "PAY_NOW",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );
  } catch {
    // A timeout or network failure does not prove that PayPal
    // failed to create the order. Preserve PENDING for recovery.
    try {
      await prisma.auditLog.create({
        data: {
          action: "PAYPAL_ORDER_CREATION_AMBIGUOUS",
          entityType: "Payment",
          entityId: payment.id,
          details: {
            planId,
            requestId,
            reason: "NETWORK_OR_TIMEOUT",
            paymentStatusPreserved: "PENDING",
          },
        },
      });
    } catch (auditError) {
      console.error("Could not write PayPal ambiguity audit:", auditError);
    }

    throw new Error("PAYPAL_ORDER_CREATION_AMBIGUOUS");
  }

  if (!response.ok) {
    const responseText = await response.text();

    let providerError: {
      name?: string;
      debug_id?: string;
      details?: Array<{ issue?: string }>;
    } = {};

    try {
      providerError = JSON.parse(responseText);
    } catch {
      // Do not store or return an unparsed provider response.
    }

    const definitiveRejection =
      response.status >= 400 &&
      response.status < 500 &&
      ![408, 409, 429].includes(response.status);

    try {
      await prisma.$transaction(async (tx) => {
        if (definitiveRejection) {
          await tx.payment.updateMany({
            where: {
              id: payment.id,
              status: "PENDING",
              paypalOrderId: null,
            },
            data: { status: "FAILED" },
          });
        }

        await tx.auditLog.create({
          data: {
            action: definitiveRejection
              ? "PAYPAL_ORDER_CREATION_FAILED"
              : "PAYPAL_ORDER_CREATION_AMBIGUOUS",
            entityType: "Payment",
            entityId: payment.id,
            details: {
              planId,
              requestId,
              httpStatus: response.status,
              providerError: providerError.name ?? null,
              providerIssue:
                providerError.details?.[0]?.issue ?? null,
              providerDebugId: providerError.debug_id ?? null,
              paymentStatusPreserved: definitiveRejection
                ? "FAILED"
                : "PENDING",
            },
          },
        });
      });
    } catch (auditError) {
      console.error("PayPal order failure audit failed:", auditError);
    }

    throw new Error(
      definitiveRejection
        ? "PAYPAL_ORDER_CREATION_FAILED"
        : "PAYPAL_ORDER_CREATION_AMBIGUOUS"
    );
  }

  let order: PayPalOrderResponse;

  try {
    order = (await response.json()) as PayPalOrderResponse;
  } catch {
    throw new Error("PAYPAL_ORDER_CREATION_AMBIGUOUS");
  }

  if (typeof order.id !== "string" || !order.id) {
    throw new Error("PAYPAL_ORDER_CREATION_AMBIGUOUS");
  }

  const paypalOrderId = order.id;

  // Persist the PayPal order ID before inspecting the approval link.
  // This lets the next request retrieve this same order.
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { paypalOrderId },
    });

    await tx.auditLog.create({
      data: {
        action: "PAYPAL_ORDER_CREATED",
        entityType: "Payment",
        entityId: payment.id,
        details: {
          planId,
          paypalOrderId,
          requestId,
          originalAmountINR: inrAmount.toFixed(2),
          convertedAmountUSD: usdAmount,
          exchangeRate,
          exchangeRateDate,
          exchangeRateProvider,
          currency: "USD",
        },
      },
    });
  });

  const approvalUrl = order.links?.find(
    (link) =>
      link.rel === "approve" ||
      link.rel === "payer-action"
  )?.href;

  if (!approvalUrl) {
    throw new Error("PAYPAL_APPROVAL_URL_MISSING");
  }

  return {
    paymentId: payment.id,
    orderId: paypalOrderId,
    approvalUrl,
    originalAmountINR: inrAmount.toFixed(2),
    amountUSD: usdAmount,
    exchangeRate,
    exchangeRateDate,
    exchangeRateProvider,
    currency: "USD",
    resumed: false,
  };
};

type PayPalAmount = {
  currency_code?: unknown;
  value?: unknown;
};

type PayPalCapture = {
  id?: unknown;
  status?: unknown;
  amount?: PayPalAmount;
};

type PayPalOrderDetails = {
  id?: unknown;
  status?: unknown;
  links?: Array<{
    rel?: string;
    href?: string;
  }>;
  purchase_units?: Array<{
    reference_id?: unknown;
    custom_id?: unknown;
    amount?: PayPalAmount;
    payments?: {
      captures?: PayPalCapture[];
    };
  }>;
};

const isMatchingAmount = (
  amount: PayPalAmount | undefined,
  expectedAmount: string
): boolean => {
  return (
    amount?.currency_code === "USD" &&
    amount?.value === expectedAmount
  );
};

export const getProcurementPayment = async (
  paymentId: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          status: true,
          emergencyId: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  return payment;
};


export const verifyProcurementPayPalOrder = async (
  paymentId: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (!payment.paypalOrderId) {
    throw new Error("PAYPAL_ORDER_ID_MISSING");
  }

  if (payment.currency !== "USD") {
    throw new Error("INVALID_PAYMENT_CURRENCY");
  }

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(payment.paypalOrderId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!response.ok) {
  const errorBody = await response.text();

  console.error("[PayPal] Order verification failed:", {
    httpStatus: response.status,
    orderId: payment.paypalOrderId,
    response: errorBody.slice(0, 1000),
  });

  throw new Error("PAYPAL_ORDER_VERIFICATION_FAILED");
}

  const order = (await response.json()) as PayPalOrderDetails;
  const purchaseUnit = order.purchase_units?.[0];
  const expectedAmount = payment.amount.toFixed(2);

  const matches =
    order.id === payment.paypalOrderId &&
    purchaseUnit?.reference_id === payment.planId &&
    purchaseUnit?.custom_id === payment.id &&
    isMatchingAmount(purchaseUnit?.amount, expectedAmount);

  if (!matches) {
    throw new Error("PAYPAL_ORDER_VALIDATION_FAILED");
  }

  const approvalUrl = order.links?.find(
    (link) =>
      link.rel === "approve" ||
      link.rel === "payer-action"
  )?.href;

  return {
    paymentId: payment.id,
    orderId: payment.paypalOrderId,
    localPaymentStatus: payment.status,
    paypalOrderStatus: order.status ?? "UNKNOWN",
    amountUSD: expectedAmount,
    currency: payment.currency,
    originalAmountINR: payment.originalAmountINR?.toString() ?? null,
    exchangeRate: payment.exchangeRate?.toString() ?? null,
    exchangeRateDate: payment.exchangeRateDate,
    exchangeRateProvider: payment.exchangeRateProvider,
    matches,
    approvalUrl: approvalUrl ?? null,
    captured: order.status === "COMPLETED",
  };
};



export const reconcileMissingPayPalOrder = async (
  paymentId: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  // Only a pending, uncaptured payment can be reconciled.
  if (payment.status !== "PENDING") {
    throw new Error("PAYMENT_NOT_ELIGIBLE_FOR_RECONCILIATION");
  }

  if (!payment.paypalOrderId) {
    throw new Error("PAYPAL_ORDER_ID_MISSING");
  }

  if (payment.paypalCaptureId) {
    throw new Error("PAYMENT_ALREADY_CAPTURED");
  }

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(
      payment.paypalOrderId
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(20000),
    }
  );

  // An existing order must never be marked as missing.
  if (response.ok) {
    throw new Error("PAYPAL_ORDER_STILL_EXISTS");
  }

  const responseText = await response.text();

  let errorBody: {
    name?: string;
    details?: Array<{ issue?: string }>;
    debug_id?: string;
  };

  try {
    errorBody = JSON.parse(responseText);
  } catch {
    throw new Error(
      "PAYPAL_ORDER_RECONCILIATION_VERIFICATION_FAILED"
    );
  }

  // Require the exact PayPal response already observed.
  const confirmedMissing =
    response.status === 404 &&
    errorBody.name === "RESOURCE_NOT_FOUND" &&
    errorBody.details?.some(
      (detail) => detail.issue === "INVALID_RESOURCE_ID"
    );

  if (!confirmedMissing) {
    throw new Error(
      "PAYPAL_ORDER_RECONCILIATION_VERIFICATION_FAILED"
    );
  }

  // Atomically retire only the exact payment we inspected.
  return prisma.$transaction(async (tx) => {
    const update = await tx.payment.updateMany({
      where: {
        id: payment.id,
        status: "PENDING",
        paypalOrderId: payment.paypalOrderId,
        paypalCaptureId: null,
      },
      data: {
        status: "FAILED",
      },
    });

    if (update.count !== 1) {
      throw new Error(
        "PAYMENT_CHANGED_DURING_RECONCILIATION"
      );
    }

    await tx.auditLog.create({
      data: {
        action: "PAYPAL_ORDER_RECONCILED_MISSING",
        entityType: "Payment",
        entityId: payment.id,
        details: {
          planId: payment.planId,
          paypalOrderId: payment.paypalOrderId,
          previousStatus: "PENDING",
          newStatus: "FAILED",
          paypalHttpStatus: response.status,
          paypalError: errorBody.name,
          paypalIssue: "INVALID_RESOURCE_ID",
          paypalDebugId: errorBody.debug_id ?? null,
          reason:
            "PayPal confirmed that the stored order ID does not exist.",
        },
      },
    });

    return {
      paymentId: payment.id,
      planId: payment.planId,
      previousStatus: "PENDING",
      status: "FAILED",
      paypalOrderId: payment.paypalOrderId,
      reconciled: true,
      reason: "PAYPAL_ORDER_NOT_FOUND",
    };
  });
};


export const captureProcurementPayPalOrder = async (
  paymentId: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      plan: true,
    },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (payment.status === "COMPLETED") {
    return {
      paymentId: payment.id,
      status: payment.status,
      captureId: payment.paypalCaptureId,
      alreadyCompleted: true,
    };
  }

  if (payment.status !== "PENDING") {
    throw new Error("PAYMENT_NOT_READY_FOR_CAPTURE");
  }

  if (!payment.paypalOrderId) {
    throw new Error("PAYPAL_ORDER_ID_MISSING");
  }

  if (payment.currency !== "USD") {
    throw new Error("INVALID_PAYMENT_CURRENCY");
  }

  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  // Verify the order with PayPal before attempting capture.
  const orderResponse = await fetch(
    `${baseUrl}/v2/checkout/orders/${encodeURIComponent(payment.paypalOrderId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!orderResponse.ok) {
    throw new Error("PAYPAL_ORDER_VERIFICATION_FAILED");
  }

  const order =
    (await orderResponse.json()) as PayPalOrderDetails;

  const purchaseUnit = order.purchase_units?.[0];
  const expectedAmount = payment.amount.toFixed(2);

  if (
  order.id !== payment.paypalOrderId ||
  order.status !== "APPROVED" ||
  purchaseUnit?.reference_id !== payment.planId ||
  purchaseUnit?.custom_id !== payment.id ||
  !isMatchingAmount(purchaseUnit.amount, expectedAmount)
) {
  throw new Error("PAYPAL_ORDER_VALIDATION_FAILED");
}

  // Claim the payment so concurrent requests cannot capture it twice.
  const claimed = await prisma.payment.updateMany({
    where: {
      id: payment.id,
      status: "PENDING",
    },
    data: {
      status: "PROCESSING",
    },
  });

  if (claimed.count !== 1) {
    throw new Error("PAYMENT_CAPTURE_ALREADY_IN_PROGRESS");
  }

  // Use a stable request ID so PayPal can recognize retries.
  const captureResponse = await fetch(
    `${baseUrl}/v2/checkout/orders/${encodeURIComponent(payment.paypalOrderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `reliefos-capture-${payment.id}`,
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!captureResponse.ok) {
    // Keep PROCESSING: the outcome may be uncertain if PayPal
    // processed the capture but the response was lost.
    await prisma.auditLog.create({
      data: {
        action: "PAYPAL_CAPTURE_REQUIRES_RECONCILIATION",
        entityType: "Payment",
        entityId: payment.id,
        details: {
          paypalOrderId: payment.paypalOrderId,
          httpStatus: captureResponse.status,
        },
      },
    });

    throw new Error("PAYPAL_CAPTURE_FAILED_RECONCILIATION_REQUIRED");
  }

  const captureResult =
    (await captureResponse.json()) as PayPalOrderDetails;

  const capture =
    captureResult.purchase_units?.[0]?.payments?.captures?.[0];

  if (
    captureResult.id !== payment.paypalOrderId ||
    capture?.status !== "COMPLETED" ||
    typeof capture.id !== "string" ||
    !capture.id ||
    !isMatchingAmount(capture.amount, expectedAmount)
  ) {
    await prisma.auditLog.create({
      data: {
        action: "PAYPAL_CAPTURE_VALIDATION_FAILED",
        entityType: "Payment",
        entityId: payment.id,
        details: {
          paypalOrderId: payment.paypalOrderId,
          captureStatus: capture?.status ?? null,
        },
      },
    });

    throw new Error("PAYPAL_CAPTURE_VALIDATION_FAILED");
  }

  const completedPayment = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        paypalCaptureId: capture.id as string,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "PAYPAL_PAYMENT_CAPTURED",
        entityType: "Payment",
        entityId: payment.id,
        details: {
          planId: payment.planId,
          paypalOrderId: payment.paypalOrderId,
          paypalCaptureId: capture.id as string,
          amount: expectedAmount,
          currency: "USD",
        },
      },
    });

    return updated;
  });

  return {
    paymentId: completedPayment.id,
    status: completedPayment.status,
    captureId: completedPayment.paypalCaptureId,
    amount: completedPayment.amount.toString(),
    currency: completedPayment.currency,
    alreadyCompleted: false,
  };
};

