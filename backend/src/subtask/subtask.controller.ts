// backend/src/subtask/subtask.controller.ts
import { Controller, Post, Delete, Patch, Body, Req, Param } from '@nestjs/common';
import type { Request } from 'express';
import { SubtaskService } from './subtask.service.js';

@Controller('subtasks')
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  @Post()
  async create(@Req() req: Request, @Body() body: { taskId: string; name: string }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.subtaskService.create({
      ...body,
      userId,
    });
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.subtaskService.delete(id, userId);
  }

  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: { completed: boolean }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.subtaskService.update(id, body, userId);
  }
}