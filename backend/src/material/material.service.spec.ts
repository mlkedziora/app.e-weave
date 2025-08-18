// backend/src/material/material.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialService } from './material.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

describe('MaterialService', () => {
  let service: MaterialService;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn(),
      teamMember: {
        findFirst: jest.fn(),
      } as any,
      materialCategory: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      } as any,
      material: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      } as any,
      materialNote: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      } as any,
      materialHistory: {
        create: jest.fn(),
      } as any,
      task: {
        findUnique: jest.fn(),
      } as any,
      projectMaterial: {
        findFirst: jest.fn(),
      } as any,
      taskMaterial: {
        create: jest.fn(),
      } as any,
    } as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create material with category if provided', async () => {
      const dto = {
        name: 'Test Material',
        fiber: 'cotton',
        length: 100,
        width: 50,
        gsm: 200,
        color: 'red',
        texture: 'smooth',
        origin: 'USA',
        supplier: 'Supp Inc',
        productCode: 'PC123',
        purchaseLocation: 'Store',
        datePurchased: '2023-01-01',
        pricePerMeter: 10,
        certifications: 'Organic',
        category: 'Fabric',
        initialNotes: 'Test note',
      };
      const userId = 'user1';
      const image = { filename: 'image.jpg' } as any;

      mockPrisma.teamMember.findFirst.mockResolvedValueOnce({ id: 'member1', teamId: 'team1' }); // for category
      mockPrisma.materialCategory.upsert.mockResolvedValue({ id: 'cat1' });
      mockPrisma.teamMember.findFirst.mockResolvedValueOnce({ id: 'member1', teamId: 'team1' }); // for material
      mockPrisma.material.create.mockResolvedValue({ id: 'mat1' });
      mockPrisma.materialNote.create.mockResolvedValue({});

      const result = await service.create(dto, userId, image);

      expect(result).toEqual({ id: 'mat1' });
      expect(mockPrisma.materialCategory.upsert).toHaveBeenCalledWith({
        where: { name_teamId: { name: dto.category, teamId: 'team1' } },
        update: {},
        create: { name: dto.category, teamId: 'team1' },
      });
      expect(mockPrisma.material.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          fiber: dto.fiber,
          length: dto.length,
          width: dto.width,
          gsm: dto.gsm,
          color: dto.color,
          texture: dto.texture,
          origin: dto.origin,
          supplier: dto.supplier,
          productCode: dto.productCode,
          purchaseLocation: dto.purchaseLocation,
          datePurchased: new Date(dto.datePurchased),
          pricePerMeter: dto.pricePerMeter,
          certifications: dto.certifications,
          category: { connect: { id: 'cat1' } },
          team: { connect: { id: 'team1' } },
          imageUrl: '/uploads/image.jpg',
          // Impacts for cotton
          climateChange: 5.5,
          waterScarcity: 2000,
          eScore: 45,
          // Others default to 0
        }),
      });
      expect(mockPrisma.materialNote.create).toHaveBeenCalledWith({
        data: { content: dto.initialNotes, materialId: 'mat1', teamMemberId: 'member1' },
      });
    });

    it('should create material without category', async () => {
      const dto = {
        name: 'Test Material',
        fiber: 'polyester',
        length: 100,
      };
      const userId = 'user1';

      mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'member1', teamId: 'team1' });
      mockPrisma.material.create.mockResolvedValue({ id: 'mat1' });

      await service.create(dto, userId);

      expect(mockPrisma.materialCategory.upsert).not.toHaveBeenCalled();
      expect(mockPrisma.material.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          fiber: dto.fiber,
          length: dto.length,
          // Defaults for others
          category: undefined,
          // Impacts for polyester
          fossilResourceDepletion: 50,
          climateChange: 3.2,
          eScore: 60,
        }),
      });
    });
  });

  describe('update', () => {
    it('should update material', async () => {
      const id = 'mat1';
      const data: Prisma.MaterialUpdateInput = { name: 'Updated Name' };
      mockPrisma.material.update.mockResolvedValue({ id: 'mat1', name: 'Updated Name' });

      const result = await service.update(id, data);
      expect(result).toEqual({ id: 'mat1', name: 'Updated Name' });
      expect(mockPrisma.material.update).toHaveBeenCalledWith({
        where: { id },
        data,
      });
    });
  });

  describe('delete', () => {
    it('should delete material', async () => {
      const id = 'mat1';
      mockPrisma.material.delete.mockResolvedValue({ id: 'mat1' });

      const result = await service.delete(id);
      expect(result).toEqual({ id: 'mat1' });
      expect(mockPrisma.material.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('findAllWithCategoryAndNotes', () => {
    it('should find all materials with category and notes', async () => {
      const rawMaterials = [
        { id: 'mat1', category: { name: 'Fabric' }, materialNotes: [] },
        { id: 'mat2', category: null, materialNotes: [] },
      ];
      mockPrisma.material.findMany.mockResolvedValue(rawMaterials);

      const result = await service.findAllWithCategoryAndNotes();
      expect(result).toEqual([
        { id: 'mat1', category: 'Fabric', materialNotes: [] },
        { id: 'mat2', category: '', materialNotes: [] },
      ]);
      expect(mockPrisma.material.findMany).toHaveBeenCalledWith({
        include: { category: true, materialNotes: true },
      });
    });
  });

  describe('findOneWithDetails', () => {
    it('should find one material with history and notes', async () => {
      const id = 'mat1';
      const material = { id: 'mat1', history: [], materialNotes: [] };
      mockPrisma.material.findUnique.mockResolvedValue(material);

      const result = await service.findOneWithDetails(id);
      expect(result).toEqual(material);
      expect(mockPrisma.material.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { history: true, materialNotes: true },
      });
    });
  });

  describe('createHistoryEntry', () => {
    it('should create history with taskId and taskMaterial if taskId provided', async () => {
      const materialId = 'mat1';
      const userId = 'user1';
      const dto = {
        previousLength: 100,
        newLength: 80,
        taskId: 'task1',
      };

      mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'member1' });
      mockPrisma.material.findUnique.mockResolvedValue({ id: 'mat1' });
      mockPrisma.materialHistory.create.mockResolvedValue({ id: 'hist1' });
      mockPrisma.task.findUnique.mockResolvedValue({ id: 'task1', projectId: 'proj1' });
      mockPrisma.projectMaterial.findFirst.mockResolvedValue({ id: 'pm1' });
      mockPrisma.taskMaterial.create.mockResolvedValue({ id: 'tm1' });
      mockPrisma.material.update.mockResolvedValue({});

      mockPrisma.$transaction.mockImplementation(async (txFn) => txFn(mockPrisma));

      const result = await service.createHistoryEntry(materialId, userId, dto);
      expect(result).toEqual({ id: 'hist1' });
      expect(mockPrisma.materialHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          materialId,
          teamMemberId: 'member1',
          previousLength: dto.previousLength,
          newLength: dto.newLength,
          taskId: dto.taskId, // Assertion for taskId
        }),
      });
      expect(mockPrisma.taskMaterial.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          taskId: dto.taskId,
          materialId,
          amountUsed: dto.previousLength - dto.newLength,
        }),
      });
      expect(mockPrisma.material.update).toHaveBeenCalledWith({
        where: { id: materialId },
        data: { length: dto.newLength },
      });
    });

    it('should create history without taskId if not provided', async () => {
      const materialId = 'mat1';
      const userId = 'user1';
      const dto = {
        previousLength: 100,
        newLength: 80,
      };

      mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'member1' });
      mockPrisma.material.findUnique.mockResolvedValue({ id: 'mat1' });
      mockPrisma.materialHistory.create.mockResolvedValue({ id: 'hist1' });
      mockPrisma.material.update.mockResolvedValue({});

      mockPrisma.$transaction.mockImplementation(async (txFn) => txFn(mockPrisma));

      const result = await service.createHistoryEntry(materialId, userId, dto);
      expect(result).toEqual({ id: 'hist1' });
      expect(mockPrisma.materialHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          materialId,
          teamMemberId: 'member1',
          previousLength: dto.previousLength,
          newLength: dto.newLength,
        }),
      });
      expect(mockPrisma.taskMaterial.create).not.toHaveBeenCalled();
    });

    it('should throw if amountUsed not positive when taskId provided', async () => {
      const materialId = 'mat1';
      const userId = 'user1';
      const dto = {
        previousLength: 100,
        newLength: 100,
        taskId: 'task1',
      };

      mockPrisma.teamMember.findFirst.mockResolvedValue({ id: 'member1' });
      mockPrisma.material.findUnique.mockResolvedValue({ id: 'mat1' });
      mockPrisma.task.findUnique.mockResolvedValue({ id: 'task1', projectId: 'proj1' });
      mockPrisma.projectMaterial.findFirst.mockResolvedValue({ id: 'pm1' });

      mockPrisma.$transaction.mockImplementation(async (txFn) => txFn(mockPrisma));

      await expect(service.createHistoryEntry(materialId, userId, dto)).rejects.toThrow('Amount used must be positive');
    });
  });

  describe('getNotes', () => {
    it('should get notes for material', async () => {
      const id = 'mat1';
      const notes = [{ id: 'note1', content: 'Note' }];
      mockPrisma.materialNote.findMany.mockResolvedValue(notes);

      const result = await service.getNotes(id);
      expect(result).toEqual(notes);
      expect(mockPrisma.materialNote.findMany).toHaveBeenCalledWith({
        where: { materialId: id },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('addNote', () => {
    it('should add note to material', async () => {
      const id = 'mat1';
      const content = 'New note';
      const userId = 'user1';
      mockPrisma.materialNote.create.mockResolvedValue({ id: 'note1' });

      const result = await service.addNote(id, content, userId);
      expect(result).toEqual({ id: 'note1' });
      expect(mockPrisma.materialNote.create).toHaveBeenCalledWith({
        data: { content, materialId: id, teamMemberId: userId },
      });
    });
  });

  describe('editNote', () => {
    it('should edit note', async () => {
      const noteId = 'note1';
      const content = 'Updated note';
      const userId = 'user1';
      mockPrisma.materialNote.update.mockResolvedValue({ id: 'note1', content });

      const result = await service.editNote(noteId, content, userId);
      expect(result).toEqual({ id: 'note1', content });
      expect(mockPrisma.materialNote.update).toHaveBeenCalledWith({
        where: { id: noteId },
        data: { content },
      });
    });
  });

  describe('deleteNote', () => {
    it('should delete note', async () => {
      const noteId = 'note1';
      const userId = 'user1';
      mockPrisma.materialNote.delete.mockResolvedValue({ id: 'note1' });

      const result = await service.deleteNote(noteId, userId);
      expect(result).toEqual({ id: 'note1' });
      expect(mockPrisma.materialNote.delete).toHaveBeenCalledWith({
        where: { id: noteId },
      });
    });
  });

  describe('getCategories', () => {
    it('should get categories for team', async () => {
      const teamId = 'team1';
      const categories = [{ id: 'cat1', name: 'Fabric' }];
      mockPrisma.materialCategory.findMany.mockResolvedValue(categories);

      const result = await service.getCategories(teamId);
      expect(result).toEqual(categories);
      expect(mockPrisma.materialCategory.findMany).toHaveBeenCalledWith({
        where: { teamId },
      });
    });
  });

  describe('createCategory', () => {
    it('should create category', async () => {
      const name = 'New Cat';
      const teamId = 'team1';
      mockPrisma.materialCategory.create.mockResolvedValue({ id: 'cat1', name, teamId });

      const result = await service.createCategory(name, teamId);
      expect(result).toEqual({ id: 'cat1', name, teamId });
      expect(mockPrisma.materialCategory.create).toHaveBeenCalledWith({
        data: { name, teamId },
      });
    });
  });
});