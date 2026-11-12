import { Router } from "express";
import { createEmergencyController, getAllEmergenciesController, getEmergencyByIdController, updateEmergencyController, updateEmergencyStatusController, } from "../controllers/emergency.controller.js";
const router = Router();
router.post("/", createEmergencyController);
router.get("/", getAllEmergenciesController);
router.get("/:id", getEmergencyByIdController);
router.patch("/:id", updateEmergencyController);
router.patch("/:id/status", updateEmergencyStatusController);
export default router;
//# sourceMappingURL=emergency.routes.js.map