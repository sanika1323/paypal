import { prisma } from "../config/database.js";
export const createVendor = async (data) => {
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
export const getVendorById = async (id) => {
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
export const updateVendor = async (id, data) => {
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
//# sourceMappingURL=vendor.service.js.map