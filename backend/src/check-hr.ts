
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkHR() {
    const user = await prisma.user.findUnique({
        where: { email: 'hr@hrms.com' },
        include: { role: true }
    });

    if (!user) {
        console.log('User hr@hrms.com not found');
        return;
    }

    console.log('User found:', user.email);
    console.log('Status:', user.status);
    console.log('Role:', user.role?.name);

    if (user.password) {
        const matchRequested = await bcrypt.compare('HR_Secure_hpt6a8vh', user.password);
        console.log('Requested password (HR_Secure_hpt6a8vh) match:', matchRequested);

        const matchSeed = await bcrypt.compare('HR@123', user.password);
        console.log('Seed password (HR@123) match:', matchSeed);
    }
}

checkHR()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
