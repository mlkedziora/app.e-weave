import { Controller, Post, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TaskService } from './task.service.js';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Req() req: Request, @Body() body: {
    projectId: string;
    name: string;
    startedAt?: string;
    deadline?: string;
    assigneeId?: string;
    subtasks?: string[];
  }) {
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
}