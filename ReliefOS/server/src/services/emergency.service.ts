import { prisma } from "../config/database.js";

export const createEmergency = async (data: {
  name: string;
  description?: string;
  location: string;
  severity: string;
}) => {
  return prisma.emergency.create({
    data,
    include: {
      _count: {
        select: {
          requests: true,
          plans: true,
        },
      },
    },
  });
};

export const getAllEmergencies = async () => {
  return prisma.emergency.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          requests: true,
          plans: true,
        },
      },
    },
  });
};

export const getEmergencyById = async (id: string) => {
  return prisma.emergency.findUnique({
    where: { id },
    include: {
      requests: {
        include: {
          organization: true,
          product: true,
        },
      },
      plans: true,
      _count: {
        select: {
          requests: true,
          plans: true,
        },
      },
    },
  });
};

export const updateEmergency = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    location?: string;
    severity?: string;
  }
) => {
  return prisma.emergency.update({
    where: { id },
    data,
  });
};

export const updateEmergencyStatus = async (
  id: string,
  isActive: boolean
) => {
  return prisma.emergency.update({
    where: { id },
    data: { isActive },
  });
};