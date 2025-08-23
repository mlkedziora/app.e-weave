// backend/src/task/task.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from '../task/dto/create-task.dto.js';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto & { userId: string }) {
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
          startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
          deadline: dto.deadline ? new Date(dto.deadline) : undefined,
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

      return tx.task.findUnique({
        where: { id: task.id },
        include: {
          subtasks: true,
        },
      });
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

  async assign(id: string, assigneeId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const assigner = await tx.teamMember.findFirst({
        where: { userId },
      });
      if (!assigner) {
        throw new Error('Team member not found');
      }

      const task = await tx.task.findUnique({
        where: { id },
        include: { project: true },
      });
      if (!task) {
        throw new Error('Task not found');
      }

      // Optional: Authorization check
      // if (assigner.role !== 'admin' && task.assignedById !== assigner.id) {
      //   throw new Error('Unauthorized to assign this task');
      // }

      await tx.taskAssignee.upsert({
        where: {
          taskId_teamMemberId: { taskId: id, teamMemberId: assigneeId },
        },
        update: {},
        create: {
          taskId: id,
          teamMemberId: assigneeId,
        },
      });

      const existingProjectAssignee = await tx.projectAssignee.findFirst({
        where: { projectId: task.projectId, teamMemberId: assigneeId },
      });
      if (!existingProjectAssignee) {
        await tx.projectAssignee.create({
          data: { projectId: task.projectId, teamMemberId: assigneeId },
        });
      }

      return tx.task.findUnique({
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
    });
  }
}