
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { role: true }
    });
    console.log('--- Current Users in DB ---');
    users.forEach(u => {
        console.log(`Email: ${u.email}, Role: ${u.role?.name || 'N/A'}, Status: ${u.status}`);
    });
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
