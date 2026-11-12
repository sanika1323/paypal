
import { prisma } from "../config/database.js";

type OrganizationType = "NGO" | "GOVERNMENT" | "SUPPLIER";

type CreateOrganizationData = {
  name: string;
  type: OrganizationType;
  email: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
};

type UpdateOrganizationData = Partial<CreateOrganizationData>;

export const createOrganization = async (
  data: CreateOrganizationData
) => {
  return prisma.organization.create({
    data,
    include: {
      _count: {
        select: {
          requests: true,
          allocations: true,
        },
      },
    },
  });
};

export const getAllOrganizations = async () => {
  return prisma.organization.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          requests: true,
          allocations: true,
        },
      },
    },
  });
};

export const getOrganizationById = async (id: string) => {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      requests: {
        include: {
          emergency: true,
          product: true,
        },
      },
      allocations: true,
      _count: {
        select: {
          requests: true,
          allocations: true,
        },
      },
    },
  });
};

export const updateOrganization = async (
  id: string,
  data: UpdateOrganizationData
) => {
  return prisma.organization.update({
    where: { id },
    data,
  });
};

export const deleteOrganization = async (id: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          requests: true,
          allocations: true,
        },
      },
    },
  });

  if (!organization) {
    return null;
  }

  if (
    organization._count.requests > 0 ||
    organization._count.allocations > 0
  ) {
    throw new Error("ORGANIZATION_HAS_LINKED_RECORDS");
  }

  return prisma.organization.delete({
    where: { id },
  });
};
