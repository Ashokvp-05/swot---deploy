import prisma from '../config/db';

export const createAsset = async (companyId: string, data: any) => {
    return prisma.asset.create({
        data: {
            ...data,
            companyId
        }
    });
};

export const getAssets = async (companyId: string) => {
    return prisma.asset.findMany({
        where: { companyId },
        include: { assignedTo: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

export const assignAsset = async (assetId: string, userId: string) => {
    return prisma.asset.update({
        where: { id: assetId },
        data: {
            assignedToId: userId,
            status: 'ASSIGNED'
        }
    });
};

export const releaseAsset = async (assetId: string) => {
    return prisma.asset.update({
        where: { id: assetId },
        data: {
            assignedToId: null,
            status: 'AVAILABLE'
        }
    });
};
