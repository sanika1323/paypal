import type { Request, Response } from "express";

import {
  createEmergency,
  getAllEmergencies,
  getEmergencyById,
  updateEmergency,
  updateEmergencyStatus,
} from "../services/emergency.service.js";

import {
  createEmergencySchema,
  updateEmergencySchema,
  emergencyStatusSchema,
} from "../utils/validators/emergency.validator.js";

export const createEmergencyController = async (
  req: Request,
  res: Response
) => {
  const validation = createEmergencySchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid emergency data",
      errors: validation.error.issues,
    });
  }

  try {
    const emergency = await createEmergency(validation.data);

    return res.status(201).json({
      success: true,
      message: "Emergency created successfully",
      data: emergency,
    });
  } catch (error) {
    console.error("Create emergency error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create emergency",
    });
  }
};

export const getAllEmergenciesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const emergencies = await getAllEmergencies();

    return res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  } catch (error) {
    console.error("Get emergencies error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve emergencies",
    });
  }
};

export const getEmergencyByIdController = async (
  req: Request,
  res: Response
) => {

const id = req.params.id;

if (typeof id !== "string" || !id.trim()) {
  return res.status(400).json({
    success: false,
    message: "Invalid emergency ID",
  });
}
  try {
    const emergency = await getEmergencyById(id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: emergency,
    });
  } catch (error) {
    console.error("Get emergency error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve emergency",
    });
  }
};

export const updateEmergencyController = async (
  req: Request,
  res: Response
) => {
  const validation = updateEmergencySchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid update data",
      errors: validation.error.issues,
    });
  }

const id = req.params.id;

if (typeof id !== "string" || !id.trim()) {
  return res.status(400).json({
    success: false,
    message: "Invalid emergency ID",
  });
}

  try {
    const emergency = await updateEmergency(
      id,
validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Emergency updated successfully",
      data: emergency,
    });
  } catch (error) {
    console.error("Update emergency error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update emergency",
    });
  }
};

export const updateEmergencyStatusController = async (
  req: Request,
  res: Response
) => {
  const validation = emergencyStatusSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "isActive must be a boolean",
    });
  }

const id = req.params.id;

if (typeof id !== "string" || !id.trim()) {
  return res.status(400).json({
    success: false,
    message: "Invalid emergency ID",
  });
}

  try {
    const emergency = await updateEmergencyStatus(
      id,
validation.data.isActive
    );

    return res.status(200).json({
      success: true,
      message: "Emergency status updated successfully",
      data: emergency,
    });
  } catch (error) {
    console.error("Update emergency status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update emergency status",
    });
  }
};