import prisma from '../config/db';

export const createJobPosting = async (companyId: string, data: any) => {
    return prisma.jobPosting.create({
        data: {
            ...data,
            companyId
        }
    });
};

export const getJobPostings = async (companyId: string) => {
    return prisma.jobPosting.findMany({
        where: { companyId },
        include: { _count: { select: { applicants: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

export const createApplicant = async (jobId: string, data: any) => {
    return prisma.applicant.create({
        data: {
            ...data,
            jobId
        }
    });
};

export const getApplicants = async (jobId: string) => {
    return prisma.applicant.findMany({
        where: { jobId },
        orderBy: { createdAt: 'desc' }
    });
};

export const updateApplicantStatus = async (applicantId: string, status: any) => {
    const applicant = await prisma.applicant.update({
        where: { id: applicantId },
        data: { status },
        include: { job: true }
    });

    // If hired, we could trigger onboarding here in future steps
    return applicant;
};
