import { prisma } from "../config/database.js";
export const createOrganization = async (data) => {
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
export const getOrganizationById = async (id) => {
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
export const updateOrganization = async (id, data) => {
    return prisma.organization.update({
        where: { id },
        data,
    });
};
export const deleteOrganization = async (id) => {
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
    if (organization._count.requests > 0 ||
        organization._count.allocations > 0) {
        throw new Error("ORGANIZATION_HAS_LINKED_RECORDS");
    }
    return prisma.organization.delete({
        where: { id },
    });
};
//# sourceMappingURL=organization.service.js.map