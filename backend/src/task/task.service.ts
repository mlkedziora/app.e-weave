import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: {
    projectId: string;
    name: string;
    startedAt: Date;
    deadline?: Date;
    assigneeId?: string;
    subtasks?: string[];
    userId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const teamMember = await tx.teamMember.findFirst({
        where: { userId: dto.userId },
      });
      if (!teamMember) {
        throw new Error('Team member not found');
      }

      const task = await tx.task.create({
        data: {
          name: dto.name,
          startedAt: dto.startedAt,
          deadline: dto.deadline,
          project: {
            connect: { id: dto.projectId },
          },
          assignedBy: {
            connect: { id: teamMember.id },
          },
        },
      });

      if (dto.subtasks?.length) {
        await tx.subtask.createMany({
          data: dto.subtasks.map((name) => ({ name, taskId: task.id })),
        });
      }

      if (dto.assigneeId) {
        await tx.taskAssignee.create({
          data: { taskId: task.id, teamMemberId: dto.assigneeId },
        });

        // Ensure the assignee is added to the project if not already
        const existing = await tx.projectAssignee.findFirst({
          where: { projectId: dto.projectId, teamMemberId: dto.assigneeId },
        });
        if (!existing) {
          await tx.projectAssignee.create({
            data: { projectId: dto.projectId, teamMemberId: dto.assigneeId },
          });
        }
      }

      return task;
    });
  }
}