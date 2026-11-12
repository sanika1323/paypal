import { prisma } from "../config/database.js";

type CreateVendorData = {
  name: string;
  location: string;
  email?: string;
};

type UpdateVendorData = {
  name?: string;
  location?: string;
  email?: string;
};

export const createVendor = async (data: CreateVendorData) => {
  if (data.email) {
    const existing = await prisma.vendor.findFirst({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error("VENDOR_EMAIL_EXISTS");
    }
  }

  return prisma.vendor.create({
    data: {
      name: data.name,
      location: data.location,
      email: data.email,
    },
    include: {
      offers: true,
    },
  });
};

export const getAllVendors = async () => {
  return prisma.vendor.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          offers: true,
        },
      },
    },
  });
};

export const getVendorById = async (id: string) => {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      offers: {
        include: {
          product: true,
        },
      },
    },
  });
};

export const updateVendor = async (
  id: string,
  data: UpdateVendorData
) => {
  if (data.email) {
    const existing = await prisma.vendor.findFirst({
      where: {
        email: data.email,
        NOT: { id },
      },
    });

    if (existing) {
      throw new Error("VENDOR_EMAIL_EXISTS");
    }
  }

  return prisma.vendor.update({
    where: { id },
    data,
  });
};