import type { Request, Response } from "express";

import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
} from "../services/vendor.service.js";

import {
  createVendorSchema,
  updateVendorSchema,
} from "../utils/validators/vendor.validator.js";

export const createVendorController = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = createVendorSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    const vendor = await createVendor(validation.data);

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      data: vendor,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "VENDOR_EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "A vendor with this email already exists",
      });
    }

    console.error("Create vendor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register vendor",
    });
  }
};

export const getAllVendorsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const vendors = await getAllVendors();

    return res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error("Get vendors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve vendors",
    });
  }
};

export const getVendorByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const vendor = await getVendorById(req.params.id as string);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Get vendor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve vendor",
    });
  }
};

export const updateVendorController = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = updateVendorSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    const vendor = await updateVendor(
      req.params.id as string,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "VENDOR_EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "A vendor with this email already exists",
      });
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    console.error("Update vendor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update vendor",
    });
  }
};