import { Router } from "express";

import {
  submitPlanForApprovalController,
  getPendingApprovalsController,
  approveProcurementPlanController,
  rejectProcurementPlanController,
} from "../controllers/approval.controller.js";

const router = Router();

router.get("/", getPendingApprovalsController);

router.post(
  "/:id/approve",
  approveProcurementPlanController
);

router.post(
  "/:id/reject",
  rejectProcurementPlanController
);

export default router;