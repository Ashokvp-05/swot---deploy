import prisma from '../config/db';

export const createPoll = async (companyId: string, data: any) => {
    return prisma.poll.create({
        data: {
            title: data.title,
            question: data.question,
            expiresAt: new Date(data.expiresAt),
            companyId,
            options: {
                create: data.options.map((opt: string) => ({ text: opt }))
            }
        }
    });
};

export const getActivePolls = async (companyId: string) => {
    return prisma.poll.findMany({
        where: {
            companyId,
            expiresAt: { gte: new Date() }
        },
        include: {
            options: {
                include: { _count: { select: { responses: true } } }
            }
        }
    });
};

export const vote = async (userId: string, pollId: string, optionId: string) => {
    return prisma.pollResponse.create({
        data: {
            pollId,
            optionId,
            userId
        }
    });
};

export const getCulturePulse = async (companyId: string) => {
    const kudos = await prisma.kudos.count({ where: { companyId } });
    const wellness = await prisma.wellnessCheck.aggregate({
        where: { companyId },
        _avg: { score: true }
    });

    return {
        totalKudos: kudos,
        avgWellnessScore: wellness._avg.score || 0
    };
};
