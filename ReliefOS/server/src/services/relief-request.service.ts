
import { prisma } from "../config/database.js";

type CreateReliefRequestData = {
  organizationId: string;
  emergencyId: string;
  productId: string;
  quantity: number;
  urgency?: number;
  notes?: string;
};

type UpdateReliefRequestData = {
  quantity?: number;
  urgency?: number;
  notes?: string | null;
  status?:
    | "PENDING"
    | "VERIFIED"
    | "CONSOLIDATED"
    | "APPROVED"
    | "FULFILLED"
    | "REJECTED";
};

export const createReliefRequest = async (
  data: CreateReliefRequestData
) => {
  const [organization, emergency, product] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: data.organizationId },
    }),
    prisma.emergency.findUnique({
      where: { id: data.emergencyId },
    }),
    prisma.product.findUnique({
      where: { id: data.productId },
    }),
  ]);

  if (!organization) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  if (organization.type !== "NGO") {
    throw new Error("ORGANIZATION_NOT_NGO");
  }

  if (!emergency) {
    throw new Error("EMERGENCY_NOT_FOUND");
  }

  if (!emergency.isActive) {
    throw new Error("EMERGENCY_INACTIVE");
  }

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return prisma.reliefRequest.create({
    data: {
      organizationId: data.organizationId,
      emergencyId: data.emergencyId,
      productId: data.productId,
      quantity: data.quantity,
      urgency: data.urgency ?? 3,
      notes: data.notes,
    },
    include: {
      organization: true,
      emergency: true,
      product: true,
    },
  });
};

export const getAllReliefRequests = async (filters?: {
  organizationId?: string;
  emergencyId?: string;
  status?: UpdateReliefRequestData["status"];
}) => {
  return prisma.reliefRequest.findMany({
    where: {
      ...(filters?.organizationId && {
        organizationId: filters.organizationId,
      }),
      ...(filters?.emergencyId && {
        emergencyId: filters.emergencyId,
      }),
      ...(filters?.status && {
        status: filters.status,
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      organization: true,
      emergency: true,
      product: true,
    },
  });
};

export const getReliefRequestById = async (id: string) => {
  return prisma.reliefRequest.findUnique({
    where: { id },
    include: {
      organization: true,
      emergency: true,
      product: true,
    },
  });
};

export const updateReliefRequest = async (
  id: string,
  data: UpdateReliefRequestData
) => {
  return prisma.reliefRequest.update({
    where: { id },
    data,
    include: {
      organization: true,
      emergency: true,
      product: true,
    },
  });
};
