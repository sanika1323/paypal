
import { Router } from "express";

import {
  createOrganizationController,
  getAllOrganizationsController,
  getOrganizationByIdController,
  updateOrganizationController,
  deleteOrganizationController,
} from "../controllers/organization.controller.js";

const router = Router();

router.post("/", createOrganizationController);
router.get("/", getAllOrganizationsController);
router.get("/:id", getOrganizationByIdController);
router.patch("/:id", updateOrganizationController);
router.delete("/:id", deleteOrganizationController);

export default router;
