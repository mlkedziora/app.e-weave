// backend/src/subtask/subtask.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SubtaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: { taskId: string; name: string; userId: string }) {
    const teamMember = await this.prisma.teamMember.findFirst({
      where: { userId: dto.userId },
    });
    if (!teamMember) {
      throw new Error('Team member not found');
    }

    return this.prisma.subtask.create({
      data: {
        name: dto.name,
        taskId: dto.taskId,
      },
    });
  }

  async delete(id: string, userId: string) {
    const teamMember = await this.prisma.teamMember.findFirst({
      where: { userId },
    });
    if (!teamMember) {
      throw new Error('Team member not found');
    }

    const subtask = await this.prisma.subtask.findUnique({
      where: { id },
      include: { task: { include: { assignees: true } } },
    });
    if (!subtask) {
      throw new Error('Subtask not found');
    }

    const isAssigned = subtask.task.assignees.some(a => a.teamMemberId === teamMember.id);
    if (!isAssigned && teamMember.role !== 'admin') {
      throw new Error('Not authorized to delete this subtask');
    }

    return this.prisma.subtask.delete({
      where: { id },
    });
  }

  async update(id: string, dto: { completed: boolean }, userId: string) {
    const teamMember = await this.prisma.teamMember.findFirst({
      where: { userId },
    });
    if (!teamMember) {
      throw new Error('Team member not found');
    }

    const subtask = await this.prisma.subtask.findUnique({
      where: { id },
      include: { task: { include: { assignees: true } } },
    });
    if (!subtask) {
      throw new Error('Subtask not found');
    }

    const isAssigned = subtask.task.assignees.some(a => a.teamMemberId === teamMember.id);
    if (!isAssigned && teamMember.role !== 'admin') {
      throw new Error('Not authorized to update this subtask');
    }

    const updatedSubtask = await this.prisma.subtask.update({
      where: { id },
      data: {
        completed: dto.completed,
        completedAt: dto.completed ? new Date() : null,
      },
    });

    // Auto-complete task if all subtasks are completed
    const allSubtasks = await this.prisma.subtask.findMany({
      where: { taskId: subtask.taskId },
    });

    const completedCount = allSubtasks.filter(s => s.completed).length;
    const total = allSubtasks.length;
    const newProgress = total > 0 ? Math.round((completedCount / total) * 100) : subtask.task.progress;

    await this.prisma.task.update({
      where: { id: subtask.taskId },
      data: {
        progress: newProgress,
        completedAt: completedCount === total ? new Date() : (dto.completed ? subtask.task.completedAt : null),
      },
    });

    return updatedSubtask;
  }
}