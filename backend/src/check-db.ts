
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@hrms.com' } });
    if (!admin) {
        console.log('Admin not found in DB');
        return;
    }
    console.log('Admin found:', admin.email);
    console.log('Admin status:', admin.status);
    console.log('Password hash exists:', !!admin.password);

    if (admin.password) {
        const match = await bcrypt.compare('Admin@123', admin.password);
        console.log('Admin@123 comparison:', match);
    }

    const manager = await prisma.user.findUnique({ where: { email: 'manager@hrms.com' } });
    if (manager && manager.password) {
        const match = await bcrypt.compare('Manager@123', manager.password);
        console.log('Manager@123 comparison:', match);
    }

    const employee = await prisma.user.findUnique({ where: { email: 'employee@hrms.com' } });
    if (employee && employee.password) {
        const match = await bcrypt.compare('Employee@123', employee.password);
        console.log('Employee@123 comparison:', match);
    }
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
