// backend/src/task/task.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('TaskService', () => {
  let service: TaskService;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn(),
      teamMember: {
        findFirst: jest.fn(),
      } as any,
      task: {
        create: jest.fn(),
        findUnique: jest.fn(),
      } as any,
      subtask: {
        createMany: jest.fn(),
      } as any,
      taskAssignee: {
        create: jest.fn(),
      } as any,
      projectAssignee: {
        findFirst: jest.fn(),
        create: jest.fn(),
      } as any,
      projectMaterial: {
        findFirst: jest.fn(),
      } as any,
      material: {
        findUnique: jest.fn(),
        update: jest.fn(),
      } as any,
      materialHistory: {
        create: jest.fn(),
      } as any,
      taskMaterial: {
        create: jest.fn(),
      } as any,
    } as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task with subtasks and assignee', async () => {
      const dto = {
        projectId: 'proj1',
        name: 'Task Name',
        startedAt: new Date(),
        deadline: new Date(),
        assigneeId: 'assignee1',
        subtasks: ['sub1', 'sub2'],
        userId: 'user1',
      };

      mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'member1' });
      mockPrisma.task.create.mockResolvedValue({ id: 'task1' });
      mockPrisma.subtask.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.taskAssignee.create.mockResolvedValue({});
      mockPrisma.projectAssignee.findFirst.mockResolvedValue(null);
      mockPrisma.projectAssignee.create.mockResolvedValue({});

      mockPrisma.$transaction.mockImplementation(async (txFn) => {
        return txFn(mockPrisma);
      });

      const result = await service.create(dto);
      expect(result).toEqual({ id: 'task1' });
      expect(mockPrisma.task.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ name: dto.name }),
      }));
      expect(mockPrisma.subtask.createMany).toHaveBeenCalled();
      expect(mockPrisma.taskAssignee.create).toHaveBeenCalled();
      expect(mockPrisma.projectAssignee.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a task with details', async () => {
      const mockTask = { id: 'task1', name: 'Task Name' };
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne('task1');
      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task1' },
        include: expect.objectContaining({
          assignees: true,
          subtasks: true,
          taskMaterials: true,
          materialHistories: true,
        }),
      });
    });
  });

  describe('addMaterial', () => {
    it('should add material to task and create history with taskId', async () => {
      const taskId = 'task1';
      const materialId = 'mat1';
      const amountUsed = 10;
      const userId = 'user1';

      mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'member1' });
      mockPrisma.task.findUnique.mockResolvedValue({ projectId: 'proj1' });
      mockPrisma.projectMaterial.findFirst.mockResolvedValue({ id: 'pm1' });
      mockPrisma.material.findUnique.mockResolvedValue({ id: 'mat1', length: 100 });
      mockPrisma.material.update.mockResolvedValue({});
      mockPrisma.materialHistory.create.mockResolvedValue({ id: 'hist1' });
      mockPrisma.taskMaterial.create.mockResolvedValue({ id: 'tm1' });

      mockPrisma.$transaction.mockImplementation(async (txFn) => {
        return txFn(mockPrisma);
      });

      const result = await service.addMaterial(taskId, materialId, amountUsed, userId);
      expect(result).toEqual({ id: 'tm1' });
      expect(mockPrisma.material.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { length: 90 },
      }));
      expect(mockPrisma.materialHistory.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          taskId: taskId, // Assert taskId is set
          previousLength: 100,
          newLength: 90,
        }),
      }));
      expect(mockPrisma.taskMaterial.create).toHaveBeenCalled();
    });

    it('should throw if insufficient material', async () => {
      mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'member1' });
      mockPrisma.task.findUnique.mockResolvedValue({ projectId: 'proj1' });
      mockPrisma.projectMaterial.findFirst.mockResolvedValue({ id: 'pm1' });
      mockPrisma.material.findUnique.mockResolvedValue({ id: 'mat1', length: 5 });

      mockPrisma.$transaction.mockImplementation(async (txFn) => {
        return txFn(mockPrisma);
      });

      await expect(service.addMaterial('task1', 'mat1', 10, 'user1')).rejects.toThrow('Insufficient material');
    });
  });
});