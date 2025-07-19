// backend/src/member/member.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';
import { Prisma } from '@prisma/client';

type TeamMemberWithDetails = Prisma.TeamMemberGetPayload<{
  include: {
    performanceMetrics: true;
    growthForecasts: true;
    materialHistories: { include: { material: { select: { name: true; color: true; fiber: true } } } };
    assignedTasks: { include: { project: { select: { name: true } }; subtasks: true } };
  };
}>;

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamMemberDto, userId: string, image?: Express.Multer.File) { 
    if (!userId) throw new Error('User ID required for team member creation');

    const data: Prisma.TeamMemberCreateInput = {
      name: dto.name,
      position: dto.position,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      userId, // Link to Clerk user
      imageUrl: image ? `/uploads/${image.filename}` : null, // New
      // role, teamId: assume from req or default
    };

    const member = await this.prisma.teamMember.create({ data });

    if (dto.projectIds?.length) {
      await this.prisma.projectAssignee.createMany({
        data: dto.projectIds.map((projectId) => ({ projectId, teamMemberId: member.id })),
        skipDuplicates: true,
      });
    }

    return member;
  }

  async findAll() {
    const members: TeamMemberWithDetails[] = await this.prisma.teamMember.findMany({
      include: {
        performanceMetrics: true,
        growthForecasts: true,
        materialHistories: {
          include: {
            material: {
              select: {
                name: true,
                color: true,
                fiber: true,
              },
            },
          },
        },
        assignedTasks: {
          include: {
            task: {
              include: {
                project: { select: { name: true } },
                subtasks: true,
              },
            },
          },
        },
      },
    });

    return members.map((member) => {
      const sortedTasks = member.assignedTasks.sort((a, b) =>
        new Date(b.task.startedAt).getTime() - new Date(a.task.startedAt).getTime()
      );

      const currentTask = sortedTasks[0]?.task || null;
      const completedTasks = sortedTasks.slice(1).map(at => at.task);

      const progress = calculateAverage(member.performanceMetrics.map((pm) => pm.score));

      return {
        id: member.id,
        userId: member.userId,
        name: member.name,
        role: member.role,
        position: member.position,
        startDate: member.startDate,
        endDate: member.endDate,
        teamId: member.teamId,
        progress,
        performanceMetrics: member.performanceMetrics,
        growthForecasts: member.growthForecasts,
        materialHistories: member.materialHistories,
        currentTask,
        completedTasks,
      };
    });
  }

  async findOne(id: string) {
    const member: TeamMemberWithDetails | null = await this.prisma.teamMember.findUnique({
      where: { id },
      include: {
        performanceMetrics: true,
        growthForecasts: true,
        materialHistories: {
          include: {
            material: {
              select: {
                name: true,
                color: true,
                fiber: true,
              },
            },
          },
        },
        assignedTasks: {
          include: {
            task: {
              include: {
                project: { select: { name: true } },
                subtasks: true,
              },
            },
          },
        },
      },
    });

    if (!member) return null;

    const sortedTasks = member.assignedTasks.sort((a, b) =>
      new Date(b.task.startedAt).getTime() - new Date(a.task.startedAt).getTime()
    );

    const currentTask = sortedTasks[0]?.task || null;
    const completedTasks = sortedTasks.slice(1).map(at => at.task);

    const progress = calculateAverage(member.performanceMetrics.map((pm) => pm.score));

    return {
      id: member.id,
      userId: member.userId,
      name: member.name,
      role: member.role,
      position: member.position,
      startDate: member.startDate,
      endDate: member.endDate,
      teamId: member.teamId,
      progress,
      performanceMetrics: member.performanceMetrics,
      growthForecasts: member.growthForecasts,
      materialHistories: member.materialHistories,
      currentTask,
      completedTasks,
    };
  }
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round(sum / values.length);
}