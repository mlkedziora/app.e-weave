// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Upsert team
  const team = await prisma.team.upsert({
    where: { name: 'SFTC' },
    update: {},
    create: {
      name: 'SFTC',
    },
  });

  // Delete old categories/materials for a clean slate
  await prisma.material.deleteMany({ where: { teamId: team.id } });
  await prisma.materialCategory.deleteMany({ where: { teamId: team.id } });

  // Recreate material categories
  const fabricsCategory = await prisma.materialCategory.create({
    data: { name: 'Fabrics', teamId: team.id },
  });

  const trimsCategory = await prisma.materialCategory.create({
    data: { name: 'Trims', teamId: team.id },
  });

  // Upsert team members
  const teamMembers = [
    {
      userId: 'user_1',
      name: 'Marcel Kedziora',
      role: 'admin',
    },
    {
      userId: 'user_2',
      name: 'Romy N.',
      role: 'manager',
    },
    {
      userId: 'user_3',
      name: 'Alex T.',
      role: 'member',
    },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { userId: member.userId },
      update: {},
      create: {
        ...member,
        teamId: team.id,
      },
    });
  }

  // Insert demo materials
  await prisma.material.createMany({
    data: [
      {
        name: 'Organic Cotton',
        categoryId: fabricsCategory.id,
        fiber: 'Cotton',
        length: 120,
        width: 150,
        gsm: 150,
        color: 'White',
        texture: 'Soft',
        origin: 'India',
        supplier: 'Organic Co.',
        productCode: 'OC-001',
        purchaseLocation: 'Mumbai',
        datePurchased: new Date(),
        pricePerMeter: 4.5,
        certifications: 'GOTS',
        notes: 'Eco-certified',
        teamId: team.id,
      },
      {
        name: 'Recycled Nylon',
        categoryId: fabricsCategory.id,
        fiber: 'Nylon',
        length: 80,
        width: 140,
        gsm: 90,
        color: 'Black',
        texture: 'Smooth',
        origin: 'Vietnam',
        supplier: 'GreenTextiles',
        productCode: 'RN-001',
        purchaseLocation: 'Hanoi',
        datePurchased: new Date(),
        pricePerMeter: 3.2,
        certifications: 'GRS',
        notes: 'Made from fishing nets',
        teamId: team.id,
      },
      {
        name: 'Corozo Buttons',
        categoryId: trimsCategory.id,
        fiber: 'Corozo',
        length: 0.5,
        width: 10,
        gsm: 300,
        color: 'Brown',
        texture: 'Hard',
        origin: 'Ecuador',
        supplier: 'ButtonCo',
        productCode: 'CB-500',
        purchaseLocation: 'Quito',
        datePurchased: new Date(),
        pricePerMeter: 0.2,
        certifications: '',
        notes: 'Used for coats',
        teamId: team.id,
      },
    ],
  });

  console.log('✅ Seed completed successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
