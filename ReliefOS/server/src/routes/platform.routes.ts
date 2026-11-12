import { Router } from "express";

import {
  approveProposalController,
  affectedRecordsController,
  createProposalController,
  getProposalController,
  listFailuresController,
  listProposalsController,
  rejectProposalController,
  reportFailureController,
  submitProposalController,
  validateProposalController,
} from "../controllers/replanning.controller.js";
import {
  authStatusController,
  confirmReceiptController,
  generateDeliveriesController,
  getDeliveryController,
  listAuditLogsController,
  listDeliveriesController,
  paypalWebhookController,
  updateDeliveryController,
  verifyCoordinatorController,
} from "../controllers/platform.controller.js";
import {
  appendStepController,
  createWorkflowController,
  getWorkflowController,
  listWorkflowsController,
  updateWorkflowController,
} from "../controllers/workflow.controller.js";
import { procurementAnalyticsController, supplierRiskController } from "../controllers/analytics.controller.js";
import { requireAgentOrCoordinator, requireCoordinator } from "../middleware/auth.js";
import { idempotent } from "../middleware/idempotency.js";

export const authRoutes = Router().get("/status", authStatusController).post("/verify", verifyCoordinatorController);

export const deliveryRoutes = Router()
  .get("/", listDeliveriesController)
  .get("/:id", getDeliveryController)
  .post("/payments/:paymentId/generate", requireCoordinator, generateDeliveriesController)
  .patch("/:id/status", requireCoordinator, updateDeliveryController)
  .post("/:id/receipt", requireCoordinator, idempotent("delivery-receipt"), confirmReceiptController);

export const auditRoutes = Router().get("/", listAuditLogsController);

// PayPal calls this; authenticity comes from the signature check, not a ReliefOS token.
export const webhookRoutes = Router().post("/paypal", paypalWebhookController);

// Real reports need a coordinator (enforced in the service); agents may file simulations.
export const supplierFailureRoutes = Router()
  .get("/", listFailuresController)
  .get("/:id/affected", affectedRecordsController)
  .post("/", requireAgentOrCoordinator, idempotent("supplier-failure"), reportFailureController);

export const replanningRoutes = Router()
  .get("/proposals", listProposalsController)
  .get("/proposals/:id", getProposalController)
  .post("/proposals", requireAgentOrCoordinator, idempotent("replanning-proposal"), createProposalController)
  .post("/proposals/:id/validations", requireAgentOrCoordinator, validateProposalController)
  .post("/proposals/:id/submit", requireAgentOrCoordinator, submitProposalController)
  .post("/proposals/:id/approve", requireCoordinator, approveProposalController)
  .post("/proposals/:id/reject", requireCoordinator, rejectProposalController);

export const workflowRoutes = Router()
  .get("/", listWorkflowsController)
  .get("/:id", getWorkflowController)
  .post("/", requireAgentOrCoordinator, idempotent("agent-workflow"), createWorkflowController)
  .patch("/:id", requireAgentOrCoordinator, updateWorkflowController)
  .post("/:id/steps", requireAgentOrCoordinator, appendStepController);

export const analyticsRoutes = Router()
  .get("/suppliers", supplierRiskController)
  .get("/procurement", procurementAnalyticsController);
