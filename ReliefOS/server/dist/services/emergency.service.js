import { prisma } from "../config/database.js";
export const createEmergency = async (data) => {
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
export const getEmergencyById = async (id) => {
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
export const updateEmergency = async (id, data) => {
    return prisma.emergency.update({
        where: { id },
        data,
    });
};
export const updateEmergencyStatus = async (id, isActive) => {
    return prisma.emergency.update({
        where: { id },
        data: { isActive },
    });
};
//# sourceMappingURL=emergency.service.js.map