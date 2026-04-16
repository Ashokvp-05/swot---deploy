
import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateHR() {
    const password = await bcrypt.hash('HR_Secure_hpt6a8vh', 10);
    const hrRole = await prisma.role.findFirst({
        where: { name: { in: ['HR', 'HR_ADMIN'] } }
    });

    if (!hrRole) {
        console.error('HR role not found');
        return;
    }

    const user = await prisma.user.upsert({
        where: { email: 'hr@hrms.com' },
        update: {
            password: password,
            roleId: hrRole.id,
            status: UserStatus.ACTIVE
        },
        create: {
            email: 'hr@hrms.com',
            name: 'HR Lead',
            password: password,
            roleId: hrRole.id,
            status: UserStatus.ACTIVE
        }
    });

    console.log('HR user password updated to: HR_Secure_hpt6a8vh');
}

updateHR()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
