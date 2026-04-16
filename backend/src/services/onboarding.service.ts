import prisma from '../config/db';

export const createOnboardingChecklist = async (companyId: string, userId: string, tasks: string[]) => {
    const data = tasks.map(title => ({
        companyId,
        userId,
        title,
        isCompleted: false
    }));

    return prisma.onboardingChecklist.createMany({
        data
    });
};

export const getMyOnboarding = async (userId: string) => {
    return prisma.onboardingChecklist.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' }
    });
};

export const completeTask = async (taskId: string, userId: string) => {
    return prisma.onboardingChecklist.update({
        where: { id: taskId, userId },
        data: {
            isCompleted: true,
            completedAt: new Date()
        }
    });
};

export const getCompanyOnboarding = async (companyId: string) => {
    return prisma.onboardingChecklist.findMany({
        where: { companyId },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
    });
};
