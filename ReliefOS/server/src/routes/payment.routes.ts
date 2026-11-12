import { Router } from "express";

import {
  createPaymentCheckoutController,
  getPaymentController,
  capturePaymentController,
  verifyPaymentOrderController,
reconcileMissingPayPalOrderController,
} from "../controllers/payment.controller.js";

import { requireCoordinator } from "../middleware/auth.js";

const router = Router();

router.post(
  "/plans/:planId/checkout",
  requireCoordinator,
  createPaymentCheckoutController
);

router.get(
  "/:paymentId/verify-paypal-order",
  verifyPaymentOrderController
);

router.get(
  "/:paymentId",
  getPaymentController
);

router.post(
  "/:paymentId/capture",
  requireCoordinator,
  capturePaymentController
);

router.post(
  "/:paymentId/reconcile-missing-order",
  requireCoordinator,
  reconcileMissingPayPalOrderController
);

export default router;