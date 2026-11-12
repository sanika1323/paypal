
import type { Request, Response } from "express";

import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "../services/organization.service.js";

import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../utils/validators/organization.validator.js";

const getId = (req: Request): string | null => {
  const id = req.params.id;

  return typeof id === "string" && id.trim()
    ? id
    : null;
};

const getErrorCode = (error: unknown): string | null => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
};

export const createOrganizationController = async (
  req: Request,
  res: Response
) => {
  const validation = createOrganizationSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid organization data",
      errors: validation.error.issues,
    });
  }

  try {
    const organization = await createOrganization(validation.data);

    return res.status(201).json({
      success: true,
      message: "Organization registered successfully",
      data: organization,
    });
  } catch (error) {
    if (getErrorCode(error) === "P2002") {
      return res.status(409).json({
        success: false,
        message: "An organization with this email already exists",
      });
    }

    console.error("Create organization error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register organization",
    });
  }
};

export const getAllOrganizationsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const organizations = await getAllOrganizations();

    return res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations,
    });
  } catch (error) {
    console.error("Get organizations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve organizations",
    });
  }
};

export const getOrganizationByIdController = async (
  req: Request,
  res: Response
) => {
  const id = getId(req);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid organization ID",
    });
  }

  try {
    const organization = await getOrganizationById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("Get organization error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve organization",
    });
  }
};

export const updateOrganizationController = async (
  req: Request,
  res: Response
) => {
  const id = getId(req);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid organization ID",
    });
  }

  const validation = updateOrganizationSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid organization update data",
      errors: validation.error.issues,
    });
  }

  try {
    const organization = await updateOrganization(
      id,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: organization,
    });
  } catch (error) {
    if (getErrorCode(error) === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    if (getErrorCode(error) === "P2002") {
      return res.status(409).json({
        success: false,
        message: "An organization with this email already exists",
      });
    }

    console.error("Update organization error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update organization",
    });
  }
};

export const deleteOrganizationController = async (
  req: Request,
  res: Response
) => {
  const id = getId(req);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid organization ID",
    });
  }

  try {
    const organization = await deleteOrganization(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
      data: organization,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ORGANIZATION_HAS_LINKED_RECORDS"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete an organization with existing relief requests or allocations",
      });
    }

    console.error("Delete organization error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete organization",
    });
  }
};
