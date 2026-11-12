import { Router } from "express";
import { createPaymentCheckoutController, getPaymentController, capturePaymentController, verifyPaymentOrderController, reconcileMissingPayPalOrderController, } from "../controllers/payment.controller.js";
const router = Router();
router.post("/plans/:planId/checkout", createPaymentCheckoutController);
router.get("/:paymentId/verify-paypal-order", verifyPaymentOrderController);
router.get("/:paymentId", getPaymentController);
router.post("/:paymentId/capture", capturePaymentController);
router.post("/:paymentId/reconcile-missing-order", reconcileMissingPayPalOrderController);
export default router;
//# sourceMappingURL=payment.routes.js.map