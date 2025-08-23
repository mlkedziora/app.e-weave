import { Module } from '@nestjs/common';
import { TaskController } from './task.controller.js';  // ← No .js
import { TaskService } from './task.service.js';      // ← No .js
import { PrismaService } from '../prisma/prisma.service.js';  // ← No .js if applicable

@Module({
  controllers: [TaskController],
  providers: [TaskService, PrismaService],
})
export class TaskModule {}