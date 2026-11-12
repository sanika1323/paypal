
import { Router } from "express";

import {
  createVendorOfferController,
  getAllVendorOffersController,
  getVendorOfferByIdController,
  updateVendorOfferController,
} from "../controllers/vendorOffer.controller.js";

const router = Router();

router.post("/", createVendorOfferController);
router.get("/", getAllVendorOffersController);
router.get("/:id", getVendorOfferByIdController);
router.patch("/:id", updateVendorOfferController);

export default router;
