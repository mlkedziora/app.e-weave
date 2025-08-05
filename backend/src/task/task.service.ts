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

  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: {
          include: { teamMember: true },
        },
        subtasks: true,
        taskMaterials: {
          include: {
            material: true,
            teamMember: { select: { name: true } },
          },
        },
        materialHistories: {
          include: {
            material: true,
            teamMember: { select: { name: true } },
          },
        },
      },
    });
  }

  async addMaterial(taskId: string, materialId: string, amountUsed: number, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const teamMember = await tx.teamMember.findFirst({ where: { userId } });
      if (!teamMember) throw new Error('Team member not found');

      const task = await tx.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
      if (!task) throw new Error('Task not found');

      const assigned = await tx.projectMaterial.findFirst({
        where: { projectId: task.projectId, materialId },
      });
      if (!assigned) throw new Error('Material not assigned to the project');

      const material = await tx.material.findUnique({ where: { id: materialId } });
      if (!material) throw new Error('Material not found');
      if (material.length < amountUsed) throw new Error('Insufficient material');

      const newLength = material.length - amountUsed;

      await tx.material.update({
        where: { id: materialId },
        data: { length: newLength },
      });

      await tx.materialHistory.create({
        data: {
          materialId,
          teamMemberId: teamMember.id,
          previousLength: material.length,
          newLength,
          taskId,
        },
      });

      return tx.taskMaterial.create({
        data: {
          taskId,
          materialId,
          amountUsed,
          teamMemberId: teamMember.id,
        },
      });
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const teamMember = await tx.teamMember.findFirst({ where: { userId } });
      if (!teamMember) {
        throw new Error('Team member not found');
      }

      const task = await tx.task.findUnique({
        where: { id },
        include: { assignedBy: true },
      });
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.assignedById !== teamMember.id && teamMember.role !== 'admin') {
        throw new Error('Not authorized to delete this task');
      }

      await tx.subtask.deleteMany({ where: { taskId: id } });
      await tx.taskAssignee.deleteMany({ where: { taskId: id } });
      await tx.taskMaterial.deleteMany({ where: { taskId: id } });
      await tx.materialHistory.deleteMany({ where: { taskId: id } });

      return tx.task.delete({ where: { id } });
    });
  }
}