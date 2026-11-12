
import { Router } from "express";

import {
  createReliefRequestController,
  getAllReliefRequestsController,
  getReliefRequestByIdController,
  updateReliefRequestController,
} from "../controllers/relief-request.controller.js";

const router = Router();

router.post("/", createReliefRequestController);
router.get("/", getAllReliefRequestsController);
router.get("/:id", getReliefRequestByIdController);
router.patch("/:id", updateReliefRequestController);

export default router;
