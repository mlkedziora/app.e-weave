// backend/src/member/member.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createClerkClient } from '@clerk/backend';
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
  private clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamMemberDto, userId: string, image?: Express.Multer.File) { 
    if (!userId) throw new Error('User ID required for team member creation');

    const adminTeamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
    const teamId = adminTeamMember.teamId;  // Get from admin user

    // Create DB entry first (pending userId)
    const data: Prisma.TeamMemberCreateInput = {
      name: dto.name,
      position: dto.position,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      userId: null,  // Pending Clerk userId
      teamId,
      imageUrl: image ? `/uploads/${image.filename}` : null, // New
      role: 'member',  // Default
    };

    const member = await this.prisma.teamMember.create({ data });

    if (dto.projectIds?.length) {
      await this.prisma.projectAssignee.createMany({
        data: dto.projectIds.map((projectId) => ({ projectId, teamMemberId: member.id })),
        skipDuplicates: true,
      });
    }

    // Send Clerk organization invitation (teamId as orgId)
    const invitation = await this.clerk.organizations.createOrganizationInvitation({
      organizationId: teamId,
      emailAddress: dto.email,
      inviterUserId: userId,
      role: 'org:member',
      publicMetadata: { role: 'member', teamId },
      redirectUrl: 'http://localhost:5173/sign-up',  // Adjust for prod
    });

    console.log(`Invitation sent to ${dto.email}: ${invitation.publicInvitationUrl}`);

    return member;
  }

  // New: Handle Clerk webhook for membership created
  async handleClerkWebhook(payload: any) {
    if (payload.type === 'organizationMembership.created') {
      const { user_id, organization_id } = payload.data;
      // Update pending member with userId
      await this.prisma.teamMember.updateMany({
        where: { teamId: organization_id, userId: null },  // Find pending by teamId
        data: { userId: user_id },
      });
      console.log(`Updated member with userId: ${user_id} for team: ${organization_id}`);
    }
    return { success: true };
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