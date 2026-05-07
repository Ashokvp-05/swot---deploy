import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log('NO_COMPANY');
    return;
  }

  const depts = [
    { name: 'Human Resources', description: 'Core personnel management and culture.' },
    { name: 'Internal Audit', description: 'Institutional compliance and risk management.' },
    { name: 'Technical Support', description: 'Infrastructure maintenance and helpdesk.' }
  ];

  for (const dept of depts) {
    await prisma.department.upsert({
      where: { name_companyId: { name: dept.name, companyId: company.id } },
      update: {},
      create: { ...dept, companyId: company.id }
    });
  }
  console.log('SUCCESS_DEPTS_READY');
}

main().finally(() => prisma.$disconnect());
