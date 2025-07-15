// backend/src/project/project.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  // Fetch list of all projects with task summary
  async findAllWithSummary() {
    const projects = await this.prisma.project.findMany({
      include: {
        tasks: true,
      },
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

  // Fetch full project detail including tasks and assignee names
  async findOneWithDetails(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignees: {
              include: {
                teamMember: {
                  select: { name: true },
                },
              },
            },
          },
        },
        assignedMaterials: {
          include: {
            material: true,
          },
        },
        notes: {
          include: {
            teamMember: {
              select: { id: true, name: true, userId: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async addNote(projectId: string, teamMemberId: string, content: string) {
    return this.prisma.projectNote.create({
      data: {
        projectId,
        teamMemberId,
        content,
      },
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

// Utility function to calculate average task progress
function calculateAverageProgress(tasks: { progress: number | null }[]): number {
  if (!tasks.length) return 0;
  const total = tasks.reduce((sum, task) => sum + (task.progress ?? 0), 0);
  return Math.round(total / tasks.length);
}