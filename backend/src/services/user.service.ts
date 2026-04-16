import prisma from '../config/db';

export const getAllUsers = async (query: { companyId: string; page?: number; limit?: number; search?: string; status?: string; managerId?: string }) => {
    const page = Number(query.page) || 1;
    let limit = Number(query.limit) || 10;
    let skip = (page - 1) * limit;

    // Special case for 'ALL'
    if (String(query.limit) === 'ALL') {
        limit = 10000; // Arbitrary high number
        skip = 0;
    }

    const where: any = { companyId: query.companyId };
    if (query.status && query.status !== 'ALL') {
        where.status = query.status;
    }
    if (query.managerId) {
        where.managerId = query.managerId;
    }
    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { department: { name: { contains: query.search, mode: 'insensitive' } } },
            { designation: { name: { contains: query.search, mode: 'insensitive' } } }
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                email: true,
                name: true,
                roleId: true,
                role: {
                    select: { name: true }
                },
                deptId: true,
                department: { select: { name: true } },
                designationId: true,
                designation: { select: { name: true } },
                branchId: true,
                branch: { select: { name: true } },
                joiningDate: true,
                status: true,
                createdAt: true,
                companyId: true
            } as any,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const updateUser = async (userId: string, companyId: string, data: any) => {
    return prisma.user.update({
        where: { id: userId, companyId },
        data: data
    });
};

export const getUserById = async (id: string, companyId: string) => {
    const user = await prisma.user.findFirst({
        where: { id, companyId },
        include: {
            role: true,
            department: true,
            designation: true,
            branch: true,
            profile: true,
            assets: true,
            manager: { select: { id: true, name: true, email: true } }
        } as any
    });
    if (!user) throw new Error('User not found');
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user as any;
    return safeUser;
};

export const updateProfile = async (id: string, companyId: string, data: any) => {
    const {
        name, email, phone, discordId, deptId, designationId, branchId, timezone, avatarUrl,
        ...profileData
    } = data;

    return prisma.user.update({
        where: { id, companyId },
        data: {
            name,
            email,
            phone,
            discordId,
            deptId,
            designationId,
            branchId,
            timezone,
            avatarUrl,
            profile: {
                upsert: {
                    create: { ...profileData },
                    update: { ...profileData }
                }
            }
        } as any,
        include: { profile: true } as any
    });
};

export const updateAvatar = async (id: string, companyId: string, avatarUrl: string) => {
    return (prisma.user as any).update({
        where: { id, companyId },
        data: { avatarUrl }
    });
};

export const deleteUser = async (id: string, companyId: string) => {
    return (prisma.user as any).delete({
        where: { id, companyId }
    });
};

export const exportPersonalData = async (id: string, companyId: string) => {
    const user = await prisma.user.findFirst({
        where: { id, companyId },
        include: {
            timeEntries: true,
            leaveRequests: true,
            notifications: true,
            role: true
        }
    });

    if (!user) throw new Error('User not found');

    const { password, resetToken, resetTokenExpiry, ...safeData } = user as any;
    return safeData;
};

export const getDocuments = async (userId: string, companyId: string) => {
    return prisma.employeeDocument.findMany({
        where: { userId, companyId },
        orderBy: { createdAt: 'desc' }
    });
};

export const uploadDocument = async (userId: string, companyId: string, data: { name: string, type: string, fileUrl: string }) => {
    return prisma.employeeDocument.create({
        data: {
            userId,
            companyId,
            name: data.name,
            type: data.type,
            fileUrl: data.fileUrl
        }
    });
};

export const deleteDocument = async (id: string, userId: string, companyId: string) => {
    return prisma.employeeDocument.delete({
        where: { id, userId, companyId }
    });
};

export const getUserDocumentsHR = async (userId: string, companyId: string) => {
    return prisma.employeeDocument.findMany({
        where: { userId, companyId },
        orderBy: { createdAt: 'desc' }
    });
};
