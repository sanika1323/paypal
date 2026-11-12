import { Router } from "express";
import { createVendorController, getAllVendorsController, getVendorByIdController, updateVendorController, } from "../controllers/vendor.controller.js";
const router = Router();
router.post("/", createVendorController);
router.get("/", getAllVendorsController);
router.get("/:id", getVendorByIdController);
router.patch("/:id", updateVendorController);
export default router;
//# sourceMappingURL=vendor.routes.js.map