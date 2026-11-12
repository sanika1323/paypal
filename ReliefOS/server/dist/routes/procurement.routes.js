import { Router } from "express";
import { optimizeProcurementController, createProcurementPlanController, getAllProcurementPlansController, getProcurementPlanByIdController, } from "../controllers/procurement.controller.js";
import { submitPlanForApprovalController, } from "../controllers/approval.controller.js";
const router = Router();
router.post("/optimize", optimizeProcurementController);
router.post("/plans", createProcurementPlanController);
router.get("/plans", getAllProcurementPlansController);
router.get("/plans/:id", getProcurementPlanByIdController);
router.post("/plans/:id/submit", submitPlanForApprovalController);
export default router;
//# sourceMappingURL=procurement.routes.js.map