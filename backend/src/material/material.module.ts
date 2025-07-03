import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 👈 add this

@Module({
  imports: [PrismaModule], // 👈 this gives access to PrismaService
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule {}
