import { Router } from "express";

import {
  optimizeProcurementController,
  createProcurementPlanController,
  getAllProcurementPlansController,
  getProcurementPlanByIdController,
} from "../controllers/procurement.controller.js";

import {
  submitPlanForApprovalController,
} from "../controllers/approval.controller.js";

import { requireAgentOrCoordinator } from "../middleware/auth.js";
import { idempotent } from "../middleware/idempotency.js";

const router = Router();

router.post("/optimize", optimizeProcurementController);

router.post("/plans", requireAgentOrCoordinator, idempotent("procurement-plan"), createProcurementPlanController);
router.get("/plans", getAllProcurementPlansController);
router.get("/plans/:id", getProcurementPlanByIdController);
router.post(
  "/plans/:id/submit",
  requireAgentOrCoordinator,
  submitPlanForApprovalController
);

export default router;