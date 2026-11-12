import { prisma } from "../config/database.js";

type CreateProductData = {
  name: string;
  category: string;
  unit: string;
};

type UpdateProductData = Partial<CreateProductData>;

export const createProduct = async (data: CreateProductData) => {
  return prisma.product.create({
    data,
    include: {
      _count: {
        select: {
          requests: true,
          offers: true,
        },
      },
    },
  });
};

export const getAllProducts = async () => {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          requests: true,
          offers: true,
        },
      },
    },
  });
};

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      requests: {
        include: {
          organization: true,
          emergency: true,
        },
      },
      offers: {
        include: {
          vendor: true,
        },
      },
      _count: {
        select: {
          requests: true,
          offers: true,
        },
      },
    },
  });
};

export const updateProduct = async (
  id: string,
  data: UpdateProductData
) => {
  return prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          requests: true,
          offers: true,
        },
      },
    },
  });

  if (!product) return null;

  if (product._count.requests > 0 || product._count.offers > 0) {
    throw new Error("PRODUCT_HAS_LINKED_RECORDS");
  }

  return prisma.product.delete({
    where: { id },
  });
};