// backend/src/project/project.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.js';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string, image?: Express.Multer.File) {
    if (!userId) throw new Error('User ID required');

    const teamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
    if (!teamMember) throw new Error('Team member not found');

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: dto.name,
          imageUrl: image ? `/Uploads/${image.filename}` : '/project.jpg', // Use placeholder
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          deadline: dto.deadline ? new Date(dto.deadline) : undefined,
          teamId: teamMember.teamId,
        },
      });

      if (dto.teamMemberIds?.length) {
        await tx.projectAssignee.createMany({
          data: dto.teamMemberIds.map((id) => ({ projectId: project.id, teamMemberId: id })),
          skipDuplicates: true,
        });
      }

      if (dto.materialIds?.length) {
        await tx.projectMaterial.createMany({
          data: dto.materialIds.map((id) => ({ projectId: project.id, materialId: id })),
          skipDuplicates: true,
        });
      }

      if (dto.initialNotes) {
        await tx.projectNote.create({
          data: {
            content: dto.initialNotes,
            projectId: project.id,
            teamMemberId: teamMember.id,
            createdAt: new Date(),
          },
        });
      }

      if (dto.initialTasks?.length) {
        for (const taskDto of dto.initialTasks) {
          const task = await tx.task.create({
            data: {
              name: taskDto.name,
              startedAt: taskDto.startDate ? new Date(taskDto.startDate) : new Date(),
              deadline: taskDto.deadline ? new Date(taskDto.deadline) : undefined,
              projectId: project.id,
              assignedById: teamMember.id,
            },
          });

          if (taskDto.subtasks?.length) {
            await tx.subtask.createMany({
              data: taskDto.subtasks.map((name) => ({ name, taskId: task.id })),
            });
          }

          if (taskDto.assigneeId) {
            await tx.taskAssignee.create({
              data: { taskId: task.id, teamMemberId: taskDto.assigneeId },
            });

            const existing = await tx.projectAssignee.findFirst({
              where: { projectId: project.id, teamMemberId: taskDto.assigneeId },
            });
            if (!existing) {
              await tx.projectAssignee.create({
                data: { projectId: project.id, teamMemberId: taskDto.assigneeId },
              });
            }
          }
        }
      }

      return project;
    });
  }

  async findAllWithSummary() {
    const projects = await this.prisma.project.findMany({
      include: { tasks: true },
    });

    return projects.map((project) => {
      const tasks = project.tasks ?? [];
      return {
        id: project.id,
        name: project.name,
        taskCount: tasks.length,
        progress: calculateAverageProgress(tasks),
      };
    });
  }

  async findOneWithDetails(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignees: {
              include: { teamMember: { select: { name: true } } },
            },
          },
        },
        assignedMaterials: { include: { material: true } },
        notes: {
          include: { teamMember: { select: { id: true, name: true, userId: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async addNote(projectId: string, teamMemberId: string, content: string) {
    return this.prisma.projectNote.create({
      data: { projectId, teamMemberId, content },
    });
  }

  async updateNote(noteId: string, content: string) {
    return this.prisma.projectNote.update({
      where: { id: noteId },
      data: { content },
    });
  }

  async deleteNote(noteId: string) {
    return this.prisma.projectNote.delete({
      where: { id: noteId },
    });
  }
}

function calculateAverageProgress(tasks: { progress: number | null }[]): number {
  if (!tasks.length) return 0;
  const total = tasks.reduce((sum, task) => sum + (task.progress ?? 0), 0);
  return Math.round(total / tasks.length);
}