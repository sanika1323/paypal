import { prisma } from "../config/database.js";
export const createVendorOffer = async (data) => {
    const vendor = await prisma.vendor.findUnique({
        where: { id: data.vendorId },
    });
    if (!vendor) {
        throw new Error("VENDOR_NOT_FOUND");
    }
    const product = await prisma.product.findUnique({
        where: { id: data.productId },
    });
    if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
    }
    return prisma.vendorOffer.create({
        data: {
            vendorId: data.vendorId,
            productId: data.productId,
            unitPrice: data.unitPrice,
            capacity: data.capacity,
            deliveryDays: data.deliveryDays,
        },
        include: {
            vendor: true,
            product: true,
        },
    });
};
export const getAllVendorOffers = async (vendorId, productId) => {
    return prisma.vendorOffer.findMany({
        where: {
            ...(vendorId && { vendorId }),
            ...(productId && { productId }),
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            vendor: true,
            product: true,
        },
    });
};
export const getVendorOfferById = async (id) => {
    return prisma.vendorOffer.findUnique({
        where: { id },
        include: {
            vendor: true,
            product: true,
        },
    });
};
export const updateVendorOffer = async (id, data) => {
    return prisma.vendorOffer.update({
        where: { id },
        data,
        include: {
            vendor: true,
            product: true,
        },
    });
};
//# sourceMappingURL=vendorOffer.service.js.map