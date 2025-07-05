import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Upsert team
  const team = await prisma.team.upsert({
    where: { name: 'SFTC' },
    update: {},
    create: { name: 'SFTC' },
  })

  // Clean slate
  await prisma.task.deleteMany()
  await prisma.projectMaterial.deleteMany()
  await prisma.project.deleteMany()
  await prisma.materialHistory.deleteMany()
  await prisma.material.deleteMany({ where: { teamId: team.id } })
  await prisma.materialCategory.deleteMany({ where: { teamId: team.id } })
  await prisma.performanceMetric.deleteMany()
  await prisma.growthForecast.deleteMany()
  await prisma.teamMember.deleteMany({ where: { teamId: team.id } })

  // Create categories
  const fabricsCategory = await prisma.materialCategory.create({
    data: { name: 'Fabrics', teamId: team.id },
  })
  const trimsCategory = await prisma.materialCategory.create({
    data: { name: 'Trims', teamId: team.id },
  })

  // Create team members
  const members = await Promise.all([
    prisma.teamMember.create({
      data: {
        userId: 'user_1',
        name: 'Nathan',
        role: 'admin',
        position: 'Pattern Engineer',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-01-31'),
        teamId: team.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        userId: 'user_2',
        name: 'David',
        role: 'manager',
        position: 'Creative Lead',
        startDate: new Date('2023-10-01'),
        endDate: new Date('2025-02-15'),
        teamId: team.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        userId: 'user_3',
        name: 'Lisa',
        role: 'member',
        position: 'Finisher',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-03-01'),
        teamId: team.id,
      },
    }),
    prisma.teamMember.create({
      data: {
        userId: 'user_4',
        name: 'Lilia',
        role: 'member',
        position: 'Embroidery Specialist',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2025-06-15'),
        teamId: team.id,
      },
    }),
  ])

  // Performance & Growth
  for (const member of members) {
    await prisma.performanceMetric.createMany({
      data: [60, 75, 90].map((score) => ({
        memberId: member.id,
        score,
      })),
    })

    await prisma.growthForecast.create({
      data: {
        memberId: member.id,
        forecastFor: new Date('2025-01-01'),
        projectedAvgDeviation: 0.1,
        projectedRole: member.position,
        rationale: 'Based on recent performance trends.',
      },
    })
  }

  // Materials (use create to get IDs)
  const silkSatin = await prisma.material.create({
    data: {
      name: 'Silk Satin',
      categoryId: fabricsCategory.id,
      fiber: 'Silk',
      length: 100,
      width: 150,
      gsm: 90,
      color: 'Navy',
      texture: 'Glossy',
      origin: 'Italy',
      supplier: 'SilkyTouch',
      productCode: 'SS-900',
      purchaseLocation: 'Milan',
      datePurchased: new Date(),
      pricePerMeter: 12.5,
      certifications: 'OEKO-TEX',
      notes: 'For premium lining',
      teamId: team.id,
    },
  })

  const corozoButtons = await prisma.material.create({
    data: {
      name: 'Corozo Buttons',
      categoryId: trimsCategory.id,
      fiber: 'Corozo',
      length: 0.5,
      width: 10,
      gsm: 300,
      color: 'Ivory',
      texture: 'Matte',
      origin: 'Ecuador',
      supplier: 'ButtonCo',
      productCode: 'CB-100',
      purchaseLocation: 'Quito',
      datePurchased: new Date(),
      pricePerMeter: 0.2,
      certifications: '',
      notes: 'For overcoats',
      teamId: team.id,
    },
  })

  // Material History
  await prisma.materialHistory.createMany({
    data: [
      {
        materialId: silkSatin.id,
        memberId: members[0].id,
        deltaQuantity: -10,
        note: 'Used for jacket mockup',
        timestamp: new Date('2025-01-30'),
      },
      {
        materialId: corozoButtons.id,
        memberId: members[1].id,
        deltaQuantity: 20,
        note: 'Received additional trims',
        timestamp: new Date('2025-02-01'),
      },
    ],
  })

  // Projects
  const [ss27, aw27] = await prisma.$transaction([
    prisma.project.create({
      data: {
        name: 'SS27',
        description: 'Spring/Summer 2027 Collection based on oceanic textures.',
        startDate: new Date('2025-01-23'),
        deadline: new Date('2025-05-23'),
        notes: 'Following PEFC guidelines and integrating team feedback.',
        teamId: team.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'AW27',
        description: 'Autumn/Winter 2027 Outerwear prototypes.',
        startDate: new Date('2025-06-01'),
        deadline: new Date('2025-09-01'),
        notes: 'Focus on circular materials and embroidery finishes.',
        teamId: team.id,
      },
    }),
  ])

  // Tasks
  await prisma.task.createMany({
    data: [
      {
        name: 'Jacket 06 – SHX',
        assigneeId: members[0].id,
        projectId: ss27.id,
        progress: 68,
        startedAt: new Date('2025-01-24'),
      },
      {
        name: 'Shirt 09 – KHG',
        assigneeId: members[1].id,
        projectId: ss27.id,
        progress: 22,
        startedAt: new Date('2025-01-25'),
      },
      {
        name: 'Jacket 06 – SHX',
        assigneeId: members[2].id,
        projectId: aw27.id,
        progress: 15,
        startedAt: new Date('2025-06-02'),
      },
      {
        name: 'Embroidery EV615 – 0TD',
        assigneeId: members[3].id,
        projectId: aw27.id,
        progress: 88,
        startedAt: new Date('2025-06-03'),
      },
    ],
  })

  console.log('✅ Seed completed successfully.')
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
