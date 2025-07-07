import { Module } from '@nestjs/common';
import { MaterialService } from './material.service.js';
import { MaterialController } from './material.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js'; // 👈 add this

@Module({
  imports: [PrismaModule], // 👈 this gives access to PrismaService
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule {}
