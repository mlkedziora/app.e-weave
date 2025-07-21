// backend/src/material/material.service.ts
import { PrismaService } from '../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateMaterialDto } from './dto/create-material.dto';
import { CreateMaterialHistoryDto } from './dto/create-material-history.dto';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMaterialDto, userId?: string, image?: Express.Multer.File) {
    let categoryId: string | undefined;
    if (dto.category) {
      const teamMember = userId ? await this.prisma.teamMember.findFirst({ where: { userId } }) : undefined;
      const category = await this.prisma.materialCategory.upsert({
        where: { name_teamId: { name: dto.category, teamId: teamMember?.teamId || '' } },
        update: {},
        create: { name: dto.category, teamId: teamMember?.teamId || '' },
      });
      categoryId = category.id;
    }

    const teamMember = userId ? await this.prisma.teamMember.findFirst({ where: { userId } }) : undefined;
    const teamId = teamMember?.teamId || '';  // Ensure teamId is always set

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
      length: dto.length,
      width: dto.width,
      gsm: dto.gsm,
      color: dto.color,
      texture: dto.texture,
      origin: dto.origin,
      supplier: dto.supplier,
      productCode: dto.productCode,
      purchaseLocation: dto.purchaseLocation,
      datePurchased: dto.datePurchased ? new Date(dto.datePurchased) : undefined,
      pricePerMeter: dto.pricePerMeter,
      certifications: dto.certifications,  // Renamed
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      team: { connect: { id: teamId } },
      imageUrl: image ? `/Uploads/${image.filename}` : '/fabric.jpg',
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

  update(id: string, data: Prisma.MaterialUpdateInput) {
    return this.prisma.material.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.material.delete({ where: { id } });
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
    });

    return materials.map((m) => ({
      ...m,
      category: m.category?.name || '',
    }));
  }

  async findOneWithDetails(id: string) {
    return this.prisma.material.findUnique({
      where: { id },
      include: {
        category: true,
        materialNotes: {
          include: { teamMember: true },
          orderBy: { updatedAt: 'desc' },
        },
        history: {
          include: { teamMember: true },
          orderBy: { changedAt: 'desc' },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.material.findUnique({ where: { id } });
  }

  async createHistoryEntry(materialId: string, userId: string, dto: CreateMaterialHistoryDto) {
    const teamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
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
      console.log('[MaterialService] Created history entry:', history);
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
    const teamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
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

  async getCategories(teamId?: string) {
    console.log('[MaterialService] getCategories called');
    const where = teamId ? { teamId } : {};
    console.log('[MaterialService] Query where:', where);
    try {
      const categories = await this.prisma.materialCategory.findMany({
        where,
        select: { id: true, name: true },
      });
      console.log('[MaterialService] Fetched categories:', categories);
      return categories || [];
    } catch (err) {
      console.error('[MaterialService] Error fetching categories:', err);
      throw new Error('Failed to fetch categories: ' + err.message);
    }
  }
}