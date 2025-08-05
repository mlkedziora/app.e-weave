import { Module } from '@nestjs/common';
import { SubtaskService } from './subtask.service.js';
import { SubtaskController } from './subtask.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SubtaskController],
  providers: [SubtaskService],
})
export class SubtaskModule {}