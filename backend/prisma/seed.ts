import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Upsert team
  const team = await prisma.team.upsert({
    where: { name: 'SFTC' },
    update: {},
    create: { name: 'SFTC' },
  });

  // // Clean slate
  // await prisma.subtask.deleteMany();
  // await prisma.task.deleteMany();
  // await prisma.projectMaterial.deleteMany();
  // await prisma.project.deleteMany();
  // await prisma.materialHistory.deleteMany();
  // await prisma.materialNote.deleteMany();
  // await prisma.material.deleteMany({ where: { teamId: team.id } });
  // await prisma.materialCategory.deleteMany({ where: { teamId: team.id } });
  // await prisma.performanceMetric.deleteMany();
  // await prisma.growthForecast.deleteMany();
  // await prisma.teamMember.deleteMany({ where: { teamId: team.id } });

  // Categories
  const [fabricsCategory, trimsCategory, fusingCategory] = await Promise.all([
    prisma.materialCategory.create({ data: { name: 'Fabrics', teamId: team.id } }),
    prisma.materialCategory.create({ data: { name: 'Trims', teamId: team.id } }),
    prisma.materialCategory.create({ data: { name: 'Fusings', teamId: team.id } }),
  ]);

  // Team members
  await prisma.teamMember.createMany({
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

  // Materials
  const allMaterials = [
    {
      categoryId: fabricsCategory.id,
      names: [
        'Organic Cotton Voile', 'Linen Twill', 'Tencel Sateen', 'Silk Crepe',
        'Wool Gabardine', 'Bamboo Jersey', 'Cupro Satin', 'Recycled Nylon', 'Hemp Canvas',
      ],
    },
    {
      categoryId: trimsCategory.id,
      names: [
        'Recycled Zip', 'Natural Rubber Elastic', 'Biodegradable Label',
        'Organic Cotton Thread', 'Eco Hook & Eye', 'Shell Button', 'Recycled Snap',
      ],
    },
    {
      categoryId: fusingCategory.id,
      names: [
        'Lightweight Fusible', 'Medium Interfacing', 'Stiff Canvas Fuse',
        'Woven Fusing', 'Eco Bamboo Fusing',
      ],
    },
  ];

  for (const group of allMaterials) {
    for (const name of group.names) {
      const fiber = faker.helpers.arrayElement([
        'Cotton', 'Linen', 'Silk', 'Wool', 'Polyester', 'Hemp', 'Bamboo',
      ]);
      const baseLength = parseFloat((Math.random() * 100 + 50).toFixed(1));

      const material = await prisma.material.create({
        data: {
          name,
          imageUrl: 'fabric.jpg',
          categoryId: group.categoryId,
          fiber,
          length: baseLength,
          width: faker.helpers.arrayElement([110, 140, 150, 160]),
          gsm: parseFloat((Math.random() * 350 + 50).toFixed(1)),
          color: faker.helpers.arrayElement(['Ivory', 'Navy', 'Charcoal', 'Sand', 'Olive']),
          texture: faker.helpers.arrayElement(['Smooth', 'Rough', 'Glossy', 'Matte', 'Crinkled']),
          origin: faker.helpers.arrayElement(['Italy', 'India', 'Vietnam', 'China', 'Peru']),
          supplier: faker.helpers.arrayElement(['TexWorld', 'GreenTex', 'ButtonCo', 'SilkyTouch']),
          productCode: `MAT-${Math.floor(Math.random() * 900 + 100)}`,
          purchaseLocation: faker.helpers.arrayElement(['Hanoi', 'Milan', 'Shanghai', 'Osaka', 'London']),
          datePurchased: faker.date.past(),
          pricePerMeter: parseFloat((Math.random() * 20 + 3).toFixed(2)),
          certifications: Math.random() > 0.5 ? faker.helpers.arrayElement(['OEKO-TEX', 'GOTS', 'GRS']) : '',
          teamId: team.id,
        },
      });

      // Create one pinned note per material
      await prisma.materialNote.create({
        data: {
          content: 'Auto-generated for seed',
          materialId: material.id,
          teamMemberId: actualMembers[0].id,
        },
      });

      // Material history
      let currentLength = material.length;
      const historyEntries = Array.from({ length: 10 }).map(() => {
        const member = faker.helpers.arrayElement(actualMembers);
        const delta = parseFloat((Math.random() * 10 + 1).toFixed(1)) * -1;
        const newLength = parseFloat((currentLength + delta).toFixed(1));
        const entry = {
          materialId: material.id,
          teamMemberId: member.id,
          previousLength: currentLength,
          newLength,
          changedAt: faker.date.recent({ days: 180 }),
        };
        currentLength = newLength;
        return entry;
      });
      await prisma.materialHistory.createMany({ data: historyEntries });

      // Additional notes
      const notes = Array.from({ length: 5 }).map(() => {
        const member = faker.helpers.arrayElement(actualMembers);
        return {
          materialId: material.id,
          teamMemberId: member.id,
          content: faker.lorem.sentence(),
          createdAt: faker.date.recent({ days: 150 }),
        };
      });
      await prisma.materialNote.createMany({ data: notes });
    }
  }

  // Performance metrics and growth forecast
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

  // Tasks and subtasks
  const subtaskProgressMap: Record<string, number> = {
    David: 7,
    Lisa: 5,
    Lilia: 9,
    Nathan: 7,
  };

  for (const member of actualMembers) {
    const currentProgress = subtaskProgressMap[member.name] ?? 5;

    // Completed tasks
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

    // Current task
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
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    console.error('📛 Full error stack:', e.stack);
    await prisma.$disconnect();
    process.exit(1);
  });
