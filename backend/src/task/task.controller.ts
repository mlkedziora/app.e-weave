import { Controller, Post, Get, Delete, Param, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TaskService } from './task.service.js';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() body: {
      projectId: string;
      name: string;
      startedAt?: string;
      deadline?: string;
      assigneeId?: string;
      subtasks?: string[];
    },
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.taskService.create({
      ...body,
      startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      userId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Post(':id/materials')
  async addMaterial(
    @Param('id') id: string,
    @Body() body: { materialId: string; amountUsed: number },
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.taskService.addMaterial(id, body.materialId, body.amountUsed, userId);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.taskService.delete(id, userId);
  }
}