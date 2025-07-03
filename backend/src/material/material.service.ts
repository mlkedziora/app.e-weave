// backend/src/material/material.service.ts
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Material } from '@prisma/client';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.MaterialCreateInput) {
    return this.prisma.material.create({ data });
  }

  findAll() {
    return this.prisma.material.findMany();
  }

  findOne(id: string) {
    return this.prisma.material.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.MaterialUpdateInput) {
    return this.prisma.material.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.material.delete({ where: { id } });
  }
}
