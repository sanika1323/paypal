import { Router } from "express";

import {
  submitPlanForApprovalController,
  getPendingApprovalsController,
  approveProcurementPlanController,
  rejectProcurementPlanController,
} from "../controllers/approval.controller.js";

import { requireCoordinator } from "../middleware/auth.js";

const router = Router();

router.get("/", getPendingApprovalsController);

router.post(
  "/:id/approve",
  requireCoordinator,
  approveProcurementPlanController
);

router.post(
  "/:id/reject",
  requireCoordinator,
  rejectProcurementPlanController
);

export default router;