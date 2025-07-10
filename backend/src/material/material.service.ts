import { PrismaService } from '../prisma/prisma.service.js'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

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

  // Used in index view
  async findAllWithCategoryAndNotes() {
    const materials = await this.prisma.material.findMany({
      include: {
        category: true,
        materialNotes: {
          orderBy: { createdAt: 'desc' },
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

  // Used in detail view
  findOneWithDetails(id: string) {
    return this.prisma.material.findUnique({
      where: { id },
      include: {
        category: true,
        materialNotes: {
          orderBy: { createdAt: 'desc' },
          include: { teamMember: true },
        },
        materialHistories: {
          orderBy: { changedAt: 'desc' },
          include: { teamMember: true },
        },
      },
    })
  }

  // Optional: raw material without joins
  findOne(id: string) {
    return this.prisma.material.findUnique({ where: { id } })
  }
}
