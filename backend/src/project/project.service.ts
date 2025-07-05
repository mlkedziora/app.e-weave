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
            assignee: {
              select: { name: true },
            },
          },
        },
      },
    });
  }
}

// Utility function to calculate average task progress
function calculateAverageProgress(tasks: { progress: number | null }[]): number {
  if (!tasks.length) return 0;
  const total = tasks.reduce((sum, task) => sum + (task.progress ?? 0), 0);
  return Math.round(total / tasks.length);
}
