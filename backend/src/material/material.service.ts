// backend/src/material/material.service.ts
import { PrismaService } from '../prisma/prisma.service.js'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CreateMaterialHistoryDto } from './dto/create-material-history.dto.js'

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.MaterialCreateInput) {
    return this.prisma.material.create({ data })
  }

  update(id: string, data: Prisma.MaterialUpdateInput) {
    return this.prisma.material.update({ where: { id }, data })
  }

  delete(id: string) {
    return this.prisma.material.delete({ where: { id } })
  }

  async findAllWithCategoryAndNotes() {
    const materials = await this.prisma.material.findMany({
      include: {
        category: true,
        materialNotes: {
          orderBy: { updatedAt: 'desc' },
          include: { teamMember: true },
          take: 3,
        },
      },
    })

    return materials.map((m) => ({
      ...m,
      category: m.category?.name || '',
    }))
  }

  async findOneWithDetails(id: string) {
    return this.prisma.material.findUnique({
      where: { id },
      include: {
        category: true,
        materialNotes: {
          include: {
            teamMember: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        history: {
          include: {
            teamMember: true,
          },
          orderBy: { changedAt: 'desc' },
        },
      },
    })
  }

  findOne(id: string) {
    return this.prisma.material.findUnique({ where: { id } })
  }

  async createHistoryEntry(
    materialId: string,
    userId: string,
    dto: CreateMaterialHistoryDto
  ) {
    const teamMember = await this.prisma.teamMember.findFirst({
      where: { userId },
    });

    if (!teamMember) {
      console.error(`[MaterialService] TeamMember not found for userId: ${userId}`);
      throw new Error('Team member not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.material.update({
        where: { id: materialId },
        data: { length: dto.newLength },
      });
      const history = await tx.materialHistory.create({
        data: {
          materialId,
          teamMemberId: teamMember.id,
          previousLength: dto.previousLength,
          newLength: dto.newLength,
          changedAt: dto.changedAt || new Date(),
        },
      });
      console.log('[MaterialService] Created history entry:', history); // Add for confirmation
      return history;
    });
  }

  async getNotes(materialId: string) {
    return this.prisma.materialNote.findMany({
      where: { materialId },
      include: { teamMember: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async addNote(materialId: string, content: string, userId: string) {
    console.log(`[addNote Service] Looking up teamMember for userId=${userId}`);
    const teamMember = await this.prisma.teamMember.findFirst({
      where: { userId },
    });
    if (!teamMember) {
      console.warn(`[addNote Service] No teamMember found for userId=${userId}`);
      throw new UnauthorizedException('Team member not found');
    }
    console.log(`[addNote Service] Found teamMember: ${teamMember.id}`);
    return this.prisma.materialNote.create({
      data: {
        content,
        materialId,
        teamMemberId: teamMember.id,
      },
      include: { teamMember: true },
    });
  }

  async editNote(noteId: string, content: string, userId: string) {
    const note = await this.prisma.materialNote.findUnique({
      where: { id: noteId },
      include: { teamMember: true },
    });

    if (!note || note.teamMember.userId !== userId) {
      throw new UnauthorizedException('Not authorized to edit this note');
    }

    return this.prisma.materialNote.update({
      where: { id: noteId },
      data: { content },
      include: { teamMember: true },
    });
  }

  async deleteNote(noteId: string, userId: string) {
    const note = await this.prisma.materialNote.findUnique({
      where: { id: noteId },
      include: { teamMember: true },
    });

    if (!note || note.teamMember.userId !== userId) {
      throw new UnauthorizedException('Not authorized to delete this note');
    }

    return this.prisma.materialNote.delete({
      where: { id: noteId },
    });
  }
}