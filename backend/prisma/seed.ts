import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Upsert team
  const team = await prisma.team.upsert({
    where: { name: 'SFTC' },
    update: {},
    create: { name: 'SFTC' },
  });

  // Clean slate
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMaterial.deleteMany();
  await prisma.project.deleteMany();
  await prisma.materialHistory.deleteMany();
  await prisma.material.deleteMany({ where: { teamId: team.id } });
  await prisma.materialCategory.deleteMany({ where: { teamId: team.id } });
  await prisma.performanceMetric.deleteMany();
  await prisma.growthForecast.deleteMany();
  await prisma.teamMember.deleteMany({ where: { teamId: team.id } });

  // Categories
  const [fabricsCategory, trimsCategory] = await Promise.all([
    prisma.materialCategory.create({ data: { name: 'Fabrics', teamId: team.id } }),
    prisma.materialCategory.create({ data: { name: 'Trims', teamId: team.id } }),
  ]);

  // Team members
  const members = await prisma.teamMember.createMany({
    data: [
      {
        userId: 'user_1',
        name: 'Nathan',
        role: 'admin',
        position: 'Pattern Engineer',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-01-31'),
        teamId: team.id,
      },
      {
        userId: 'user_2',
        name: 'David',
        role: 'manager',
        position: 'Creative Lead',
        startDate: new Date('2023-10-01'),
        endDate: new Date('2025-02-15'),
        teamId: team.id,
      },
      {
        userId: 'user_3',
        name: 'Lisa',
        role: 'member',
        position: 'Finisher',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-03-01'),
        teamId: team.id,
      },
      {
        userId: 'user_4',
        name: 'Lilia',
        role: 'member',
        position: 'Embroidery Specialist',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2025-06-15'),
        teamId: team.id,
      },
    ],
    skipDuplicates: true,
  });

  const actualMembers = await prisma.teamMember.findMany({ where: { teamId: team.id } });

  // Performance and growth
  for (const member of actualMembers) {
    await prisma.performanceMetric.createMany({
      data: [60, 75, 90].map(score => ({ memberId: member.id, score })),
    });

    await prisma.growthForecast.create({
      data: {
        memberId: member.id,
        forecastFor: new Date('2025-01-01'),
        projectedAvgDeviation: 0.1,
        projectedRole: member.position,
        rationale: 'Based on recent performance trends.',
      },
    });
  }

  // Materials
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
  });

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
  });

  await prisma.materialHistory.createMany({
    data: [
      {
        materialId: silkSatin.id,
        teamMemberId: actualMembers[0].id,
        previousLength: 100,
        newLength: 90,
        changedAt: new Date('2025-01-30'),
      },
      {
        materialId: corozoButtons.id,
        teamMemberId: actualMembers[1].id,
        previousLength: 0.5,
        newLength: 20.5,
        changedAt: new Date('2025-02-01'),
      },
    ],
  });

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
  ]);

  // Member-specific subtask completions
  const subtaskProgressMap: Record<string, number> = {
    David: 7,
    Lisa: 5,
    Lilia: 9,
    Nathan: 7,
  };

  for (const member of actualMembers) {
    const currentProgress = subtaskProgressMap[member.name] ?? 5;

    const completedTasks = Array.from({ length: 19 }).map((_, i) => ({
      name: `Complete Garment ${i + 1} – SHX`,
      subtasks: [
        '✓ Prep fabric',
        '✓ Cut pieces',
        '✓ Sew components',
        '✓ Attach trims',
        '✓ Press garment',
      ],
    }));

    for (const task of completedTasks) {
      const t = await prisma.task.create({
        data: {
          name: task.name,
          assigneeId: member.id,
          projectId: ss27.id,
          assignedById: member.id,
          progress: 100,
          startedAt: new Date('2025-01-01'),
          completedAt: new Date('2025-01-10'),
        },
      });

      await prisma.subtask.createMany({
        data: task.subtasks.map(name => ({
          name,
          completed: true,
          taskId: t.id,
        })),
      });
    }

    const currentTask = await prisma.task.create({
      data: {
        name: `Construct Jacket 06 – SHX`,
        assigneeId: member.id,
        projectId: ss27.id,
        assignedById: member.id,
        startedAt: new Date('2025-02-01'),
        progress: currentProgress * 10,
      },
    });

    const currentSubtasks = [
      'Cut bodice',
      'Cut lining',
      'Stitch two-piece sleeve',
      'Place shoulder pads',
      'Fuse interfacing',
      'Sew darts',
      'Attach pockets',
      'Assemble collar',
      'Topstitch finish',
      'Final press',
    ];

    await prisma.subtask.createMany({
      data: currentSubtasks.map((name, i) => ({
        name,
        completed: i < currentProgress,
        taskId: currentTask.id,
      })),
    });
  }

  console.log('✅ Seed completed successfully.');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
