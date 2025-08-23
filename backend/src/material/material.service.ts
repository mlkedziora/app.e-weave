// backend/src/material/material.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { CreateMaterialHistoryDto } from './dto/create-material-history.dto.js';
import { Express } from 'express'; // For Multer typing
import { Prisma } from '@prisma/client'; // For Prisma types

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDto, userId?: string, image?: Express.Multer.File) {
    let categoryId: string | undefined;
    if (dto.category) {
      const teamMember = userId ? await this.prisma.teamMember.findFirst({ where: { userId } }) : undefined;
      if (!teamMember) throw new Error('Team member not found for category creation');
      const category = await this.prisma.materialCategory.upsert({
        where: { name_teamId: { name: dto.category, teamId: teamMember.teamId } },
        update: {},
        create: { name: dto.category, teamId: teamMember.teamId },
      });
      categoryId = category.id;
    }

    const teamMember = userId ? await this.prisma.teamMember.findFirst({ where: { userId } }) : undefined;
    if (!teamMember) throw new Error('Team member not found');
    const teamId = teamMember.teamId;

    // Temporary hardcoded approximations for impact fields (based on fiber; expand as needed)
    let climateChange = 0.0;
    let ozoneDepletion = 0.0;
    let humanToxicityCancer = 0.0;
    let humanToxicityNonCancer = 0.0;
    let particulateMatter = 0.0;
    let ionisingRadiation = 0.0;
    let photochemicalOzoneFormation = 0.0;
    let acidification = 0.0;
    let terrestrialEutrophication = 0.0;
    let freshwaterEutrophication = 0.0;
    let marineEutrophication = 0.0;
    let freshwaterEcotoxicity = 0.0;
    let landUse = 0.0;
    let waterScarcity = 0.0;
    let mineralResourceDepletion = 0.0;
    let fossilResourceDepletion = 0.0;
    let eScore = 0.0;

    // Simple fiber-based approximation (e.g., cotton has high water use; synthetic high fossil)
    switch (dto.fiber.toLowerCase()) {
      case 'cotton':
        climateChange = 5.5; // kg CO2-eq per kg
        waterScarcity = 2000; // m3-eq per kg
        eScore = 45; // Average score
        break;
      case 'polyester':
        fossilResourceDepletion = 50; // MJ per kg
        climateChange = 3.2;
        eScore = 60;
        break;
      // Add more cases (e.g., wool, silk) or integrate real calc later
      default:
        // Defaults already 0
        break;
    }

    const data: Prisma.MaterialCreateInput = {
      name: dto.name,
      fiber: dto.fiber,
      length: dto.length || 0,
      width: dto.width || 0,
      gsm: dto.gsm || 0,
      color: dto.color || '',
      texture: dto.texture || '',
      origin: dto.origin || '',
      supplier: dto.supplier || '',
      productCode: dto.productCode || '',
      purchaseLocation: dto.purchaseLocation || '',
      datePurchased: dto.datePurchased ? new Date(dto.datePurchased) : undefined,
      pricePerMeter: dto.pricePerMeter || 0,
      certifications: dto.certifications || '',
      category: categoryId ? { connect: { id: categoryId } } : undefined, // Fixed
      team: { connect: { id: teamId } },
      imageUrl: image ? `/uploads/${image.filename}` : '/fabric.jpg',
      // Add calculated impacts
      climateChange,
      ozoneDepletion,
      humanToxicityCancer,
      humanToxicityNonCancer,
      particulateMatter,
      ionisingRadiation,
      photochemicalOzoneFormation,
      acidification,
      terrestrialEutrophication,
      freshwaterEutrophication,
      marineEutrophication,
      freshwaterEcotoxicity,
      landUse,
      waterScarcity,
      mineralResourceDepletion,
      fossilResourceDepletion,
      eScore,
    };

    const material = await this.prisma.material.create({ data });

    if (dto.initialNotes && teamMember) {
      await this.prisma.materialNote.create({
        data: { content: dto.initialNotes, materialId: material.id, teamMemberId: teamMember.id },
      });
    }

    return material;
  }

  async update(id: string, data: Prisma.MaterialUpdateInput) {
    return this.prisma.material.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.material.delete({
      where: { id },
    });
  }

  async findAllWithCategoryAndNotes(userId: string) {
    const teamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
    if (!teamMember) throw new Error('Team member not found');
    const rawMaterials = await this.prisma.material.findMany({
      where: { teamId: teamMember.teamId },
      include: { category: true, materialNotes: true },
    });
    return rawMaterials.map(material => ({
      ...material,
      category: material.category?.name || '',  // Flatten to string; '' for uncategorized
    }));
  }

  async findOneWithDetails(id: string) {
    return this.prisma.material.findUnique({
      where: { id },
      include: {
        history: {
          include: {
            teamMember: { select: { name: true } }, // For "User Taking"
            task: {
              include: {
                project: { select: { name: true } }, // For "Project"
              },
            }, // For "Task" name
          },
          orderBy: {
            changedAt: 'desc',
          },
        },
        materialNotes: {
          include: {
            teamMember: { select: { name: true, userId: true } }, // For note author + edit auth
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        assignedTo: { // Bonus: For "ASSIGNED PROJECTS" if needed deeper
          include: { project: true },
        },
      },
    });
  }

  async createHistoryEntry(materialId: string, currentUserId: string, dto: CreateMaterialHistoryDto) {
    return this.prisma.$transaction(async (tx) => {
      const currentTeamMember = await tx.teamMember.findFirst({ where: { userId: currentUserId } });
      if (!currentTeamMember) throw new Error('Current team member not found');

      let teamMemberForHistory = currentTeamMember;

      if (dto.taskId) {
        if (!dto.teamMemberId) {
          throw new Error('teamMemberId is required when taskId is provided');
        }
        const selectedTeamMember = await tx.teamMember.findUnique({ where: { id: dto.teamMemberId } });
        if (!selectedTeamMember || selectedTeamMember.teamId !== currentTeamMember.teamId) {
          throw new Error('Invalid selected team member');
        }
        teamMemberForHistory = selectedTeamMember;

        const task = await tx.task.findUnique({ where: { id: dto.taskId }, include: { project: true } });
        if (!task) throw new Error('Task not found');

        const assigned = await tx.projectMaterial.findFirst({
          where: { projectId: task.projectId, materialId },
        });
        if (!assigned) throw new Error('Material not assigned to the project');

        const amountUsed = dto.previousLength - dto.newLength;
        if (amountUsed <= 0) throw new Error('Amount used must be positive');

        await tx.taskMaterial.create({
          data: {
            taskId: dto.taskId,
            materialId,
            amountUsed,
            teamMemberId: teamMemberForHistory.id,
          },
        });
      } else {
        const amountAdded = dto.newLength - dto.previousLength;
        if (amountAdded <= 0) throw new Error('Amount added must be positive for restocking');
      }

      const material = await tx.material.findUnique({ where: { id: materialId } });
      if (!material) throw new Error('Material not found');

      // Update material length
      await tx.material.update({
        where: { id: materialId },
        data: { length: dto.newLength },
      });

      // Create history entry
      const history = await tx.materialHistory.create({
        data: {
          materialId,
          teamMemberId: teamMemberForHistory.id,
          previousLength: dto.previousLength,
          newLength: dto.newLength,
          taskId: dto.taskId || null,
        },
      });

      return history;
    });
  }

  async getNotes(id: string) {
    return this.prisma.materialNote.findMany({
      where: { materialId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addNote(id: string, content: string, userId: string) {
    return this.prisma.materialNote.create({
      data: {
        content,
        materialId: id,
        teamMemberId: userId,
      },
    });
  }

  async editNote(noteId: string, content: string, userId: string) {
    // Add auth check if needed
    return this.prisma.materialNote.update({
      where: { id: noteId },
      data: { content },
    });
  }

  async deleteNote(noteId: string, userId: string) {
    // Add auth check if needed
    return this.prisma.materialNote.delete({
      where: { id: noteId },
    });
  }

  async getCategories(userId: string) {
    const teamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
    if (!teamMember) throw new Error('Team member not found');
    return this.prisma.materialCategory.findMany({
      where: { teamId: teamMember.teamId },
    });
  }

  async createCategory(name: string, userId: string) {
    const teamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
    if (!teamMember) throw new Error('Team member not found');
    return this.prisma.materialCategory.create({
      data: { name, teamId: teamMember.teamId },
    });
  }

  async deleteCategory(id: string, userId: string) {
    const teamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
    if (!teamMember) throw new Error('Team member not found');

    const category = await this.prisma.materialCategory.findUnique({ where: { id } });
    if (!category || category.teamId !== teamMember.teamId) throw new Error('Category not found or unauthorized');

    await this.prisma.$transaction(async (tx) => {
      await tx.material.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
      await tx.materialCategory.delete({
        where: { id },
      });
    });

    return { success: true };
  }

  async assignProject(materialId: string, projectId: string, taskIds: string[], userId: string) {
    const teamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
    if (!teamMember) throw new NotFoundException('Team member not found');

    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    if (!material || material.teamId !== teamMember.teamId) throw new NotFoundException('Material not found');

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.teamId !== teamMember.teamId) throw new NotFoundException('Project not found');

    return this.prisma.$transaction(async (tx) => {
      // Assign to project
      const existingProjectAssign = await tx.projectMaterial.findFirst({
        where: { materialId, projectId },
      });
      if (!existingProjectAssign) {
        await tx.projectMaterial.create({
          data: { materialId, projectId },
        });
      }

      // Assign to tasks if provided
      for (const taskId of taskIds) {
        const task = await tx.task.findUnique({ where: { id: taskId } });
        if (!task || task.projectId !== projectId) throw new NotFoundException(`Task ${taskId} not found or not in project`);

        const existingTaskAssign = await tx.taskMaterial.findFirst({
          where: { materialId, taskId },
        });
        if (!existingTaskAssign) {
          await tx.taskMaterial.create({
            data: { materialId, taskId, amountUsed: 0, teamMemberId: teamMember.id },
          });
        }
      }

      return true;
    });
  }
}