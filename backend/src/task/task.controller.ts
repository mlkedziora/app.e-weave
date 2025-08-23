// backend/src/task/task.controller.ts
import { Controller, Post, Get, Delete, Param, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TaskService } from './task.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { AssignTaskDto } from './dto/assign-task.dto.js';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {
    console.log('[TaskController] Initialized with TaskService injected');
  }

  @Get('test-assign')
  async testAssign() {
    return { message: 'Test route working' };
  }

  // Move the new route to the top for testing (order shouldn't matter, but rules out scanning issues)
  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
    @Req() req: Request,
  ) {
    console.log('[TaskController] Assign method called for task ID:', id);
    console.log('[TaskController] Received DTO:', dto); // ✅ Add this log
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.taskService.assign(id, dto.assigneeId, userId);
  }

  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateTaskDto,
  ) {
    console.log('[TaskController] Create method called with DTO:', dto);
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.taskService.create({ ...dto, userId });
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