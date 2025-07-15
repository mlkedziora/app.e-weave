import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

function getRandomImpact(fiber: string, category: string, min: number, max: number, precision: number): number {
  let adjustedMin = min;
  let adjustedMax = max;

  // Adjust ranges based on fiber for realism (e.g., cotton high water, polyester high fossil)
  if (fiber === 'Cotton' || fiber === 'Linen') {
    if (category === 'water') adjustedMax *= 1.5; // Higher water scarcity
    if (category === 'climate') adjustedMin *= 1.2; // Slightly higher CO2
  } else if (fiber === 'Polyester') {
    if (category === 'fossil') adjustedMax *= 1.5; // Higher fossil depletion
    if (category === 'water') adjustedMin *= 0.5; // Lower water
  } else if (fiber === 'Wool' || fiber === 'Silk') {
    if (category === 'land') adjustedMax *= 2; // Higher land use
  } // Others (Hemp, Bamboo) use base ranges for eco-friendly bias

  return parseFloat((Math.random() * (adjustedMax - adjustedMin) + adjustedMin).toFixed(precision));
}

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
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectNote.deleteMany();
  await prisma.projectMaterial.deleteMany();
  await prisma.project.deleteMany();
  await prisma.materialHistory.deleteMany();
  await prisma.materialNote.deleteMany();
  await prisma.material.deleteMany({ where: { teamId: team.id } });
  await prisma.materialCategory.deleteMany({ where: { teamId: team.id } });
  await prisma.performanceMetric.deleteMany();
  await prisma.growthForecast.deleteMany();
  await prisma.teamMember.deleteMany({ where: { teamId: team.id } });

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
        userId: 'user_2zPs2klPU4dIx3dhTpEij5t8Jkq',
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
  const nathan = actualMembers.find(m => m.name === 'Nathan');

  // Materials
  const allMaterialsData = [
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

  const createdMaterials = [];

  for (const group of allMaterialsData) {
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
          climateChange: getRandomImpact(fiber, 'climate', 1, 10, 2),               
          ozoneDepletion: getRandomImpact(fiber, 'ozone', 0.00001, 0.001, 5),     
          humanToxicityCancer: getRandomImpact(fiber, 'humanCancer', 1e-7, 1e-5, 8), 
          humanToxicityNonCancer: getRandomImpact(fiber, 'humanNonCancer', 1e-6, 1e-4, 7), 
          particulateMatter: getRandomImpact(fiber, 'particulate', 1e-7, 1e-5, 8), 
          ionisingRadiation: getRandomImpact(fiber, 'radiation', 0.01, 1, 3),      
          photochemicalOzoneFormation: getRandomImpact(fiber, 'ozoneForm', 0.01, 0.5, 3), 
          acidification: getRandomImpact(fiber, 'acid', 0.001, 0.1, 3),            
          terrestrialEutrophication: getRandomImpact(fiber, 'terrEutro', 0.01, 0.5, 3), 
          freshwaterEutrophication: getRandomImpact(fiber, 'freshEutro', 0.0001, 0.01, 4), 
          marineEutrophication: getRandomImpact(fiber, 'marineEutro', 0.001, 0.05, 3), 
          freshwaterEcotoxicity: getRandomImpact(fiber, 'ecoTox', 1, 100, 2),      
          landUse: getRandomImpact(fiber, 'land', 1e-5, 1e-3, 6),                  
          waterScarcity: getRandomImpact(fiber, 'water', 1, 50, 2),                
          mineralResourceDepletion: getRandomImpact(fiber, 'mineral', 1e-6, 1e-4, 7), 
          fossilResourceDepletion: getRandomImpact(fiber, 'fossil', 10, 100, 2),   
          eScore: faker.number.int({ min: 50, max: 100 }),
        },
      });

      createdMaterials.push(material);

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
      const notes = Array.from({ length: 10 }).map(() => {
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

  // Projects - 10 random fashion-related
  const projectNames = [
    'Haute Couture FW2025',
    'SS2026 Ready-to-Wear',
    'AW2025 Streetwear',
    'Couture Bridal 2026',
    'Pre-Fall 2025',
    'Resort 2026',
    'Menswear SS2027',
    'Evening Gowns AW2026',
    'Sustainable Fashion Week 2025',
    'Capsule Collection FW2026',
  ];

  const projects = await prisma.$transaction(
    projectNames.map(name => prisma.project.create({
      data: {
        name,
        description: faker.lorem.sentence(),
        startDate: faker.date.future(),
        deadline: faker.date.future({ years: 1 }),
        teamId: team.id,
      },
    }))
  );

  // Assign materials to projects
  const allMaterials = await prisma.material.findMany();
  for (const project of projects) {
    const selectedMaterials = faker.helpers.arrayElements(allMaterials, 5);
    for (const mat of selectedMaterials) {
      await prisma.projectMaterial.create({
        data: {
          projectId: project.id,
          materialId: mat.id,
        },
      });
    }
  }

  // Tasks and subtasks for each project
  const subtaskProgressMap: Record<string, number> = {
    David: 7,
    Lisa: 5,
    Lilia: 9,
    Nathan: 7,
  };

  for (const project of projects) {
    // Assign 3 out of 4 members to this project (leave one out randomly, but Nathan always overview)
    const assignedMembers = faker.helpers.arrayElements(actualMembers.filter(m => m.name !== 'Nathan'), 2);
    assignedMembers.push(nathan); // Nathan always in

    const unassignedMember = actualMembers.find(m => !assignedMembers.includes(m) && m.name !== 'Nathan');

    for (const member of assignedMembers) {
      const currentProgress = subtaskProgressMap[member.name] ?? 5;

      // Completed tasks (random 5-10)
      const numCompleted = faker.number.int({ min: 5, max: 10 });
      const completedTasks = Array.from({ length: numCompleted }).map((_, i) => ({
        name: `Completed Task ${i + 1} for ${project.name}`,
        subtasks: Array.from({ length: 5 }).map(() => faker.lorem.words(2)),
      }));

      for (const taskData of completedTasks) {
        const t = await prisma.task.create({
          data: {
            name: taskData.name,
            projectId: project.id,
            assignedById: member.id,
            progress: 100,
            startedAt: faker.date.past(),
            completedAt: faker.date.past(),
          },
        });

        // Assign to 1-3 members from assignedMembers
        const taskAssignees = faker.helpers.uniqueArray(assignedMembers, faker.number.int({ min: 1, max: 3 }));
        for (const assignee of taskAssignees) {
          await prisma.taskAssignee.create({
            data: {
              taskId: t.id,
              teamMemberId: assignee.id,
            },
          });
        }

        await prisma.subtask.createMany({
          data: taskData.subtasks.map(name => ({
            name,
            completed: true,
            taskId: t.id,
          })),
        });
      }

      // Ongoing tasks (2-5 per member, progress 0-90)
      const numOngoing = faker.number.int({ min: 2, max: 5 });
      for (let i = 0; i < numOngoing; i++) {
        const progress = faker.number.int({ min: 0, max: 90 });
        const t = await prisma.task.create({
          data: {
            name: `Ongoing Task ${i + 1} for ${project.name}`,
            projectId: project.id,
            assignedById: member.id,
            progress,
            startedAt: faker.date.recent(),
          },
        });

        // Assign to 1-3 members from assignedMembers
        const taskAssignees = faker.helpers.uniqueArray(assignedMembers, faker.number.int({ min: 1, max: 3 }));
        for (const assignee of taskAssignees) {
          await prisma.taskAssignee.create({
            data: {
              taskId: t.id,
              teamMemberId: assignee.id,
            },
          });
        }

        const subtasks = Array.from({ length: 10 }).map(() => faker.lorem.words(2));
        const completedCount = Math.floor((progress / 100) * subtasks.length);
        await prisma.subtask.createMany({
          data: subtasks.map((name, j) => ({
            name,
            completed: j < completedCount,
            taskId: t.id,
          })),
        });
      }
    }

    // Project notes
    const notes = Array.from({ length: 10 }).map(() => {
      const member = faker.helpers.arrayElement(actualMembers);
      return {
        projectId: project.id,
        teamMemberId: member.id,
        content: faker.lorem.sentence(),
        createdAt: faker.date.recent({ days: 150 }),
      };
    });
    await prisma.projectNote.createMany({ data: notes });
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