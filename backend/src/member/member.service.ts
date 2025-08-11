// backend/src/member/member.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createClerkClient } from '@clerk/backend';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';
import { Prisma } from '@prisma/client'; // For Prisma types
import { Express } from 'express'; // For Multer typing

type TeamMemberWithDetails = Prisma.TeamMemberGetPayload<{
  include: {
    performanceMetrics: true,
    growthForecasts: true,
    materialHistories: { include: { material: { select: { name: true; color: true; fiber: true } } } },
    assignedTasks: { include: { task: { include: { project: { select: { name: true } }; subtasks: true } } } },
  };
}>;

@Injectable()
export class MemberService {
  private clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamMemberDto, userId: string, image?: Express.Multer.File) {
    if (!userId) throw new Error('User ID required for team member creation');

    const adminTeamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
    if (!adminTeamMember) throw new Error('Admin team member not found');
    const teamId = adminTeamMember.teamId;
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team?.clerkOrgId) throw new Error('Team not synced with Clerk organization');

    const data: Prisma.TeamMemberCreateInput = {
      name: dto.name,
      email: dto.email,
      position: dto.position,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      userId: null,
      team: { connect: { id: teamId } }, // Fixed: use team connect instead of teamId
      imageUrl: image ? `/uploads/${image.filename}` : null,
      role: 'member',
    };

    const member = await this.prisma.teamMember.create({ data });

    if (dto.projectIds?.length) {
      await this.prisma.projectAssignee.createMany({
        data: dto.projectIds.map((projectId) => ({ projectId, teamMemberId: member.id })),
        skipDuplicates: true,
      });
    }

    const invitation = await this.clerkClient.organizations.createOrganizationInvitation({
      organizationId: team.clerkOrgId,
      emailAddress: dto.email,
      inviterUserId: userId,
      role: 'org:member',
      publicMetadata: { role: 'member', teamId },
      redirectUrl: 'http://localhost:5173/sign-up',
    });

    console.log(`Invitation sent to ${dto.email}: ${invitation.url}`);

    return member;
  }

  async handleClerkWebhook(payload: any) {
    if (payload.type === 'organizationMembership.created') {
      const { user_id, organization_id } = payload.data;

      const user = await this.clerkClient.users.getUser(user_id);
      const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
      if (!email) {
        console.error('No primary email found for user');
        return { success: false };
      }

      const team = await this.prisma.team.findFirst({ where: { clerkOrgId: organization_id } });
      if (!team) {
        console.error('No team found for organization');
        return { success: false };
      }

      const member = await this.prisma.teamMember.findFirst({
        where: { email, userId: null, teamId: team.id },
      });
      if (!member) {
        console.error('No pending member found');
        return { success: false };
      }

      await this.prisma.teamMember.update({
        where: { id: member.id },
        data: { userId: user_id, email: null },
      });

      await this.clerkClient.users.updateUser(user_id, {
        publicMetadata: { role: member.role, teamId: member.teamId },
      });

      console.log(`Updated member ${member.id} with userId: ${user_id}`);
      return { success: true };
    }
    return { success: false, message: 'Unhandled event type' };
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
      const assignedTasks = member.assignedTasks;

      const pendingTasks = assignedTasks
        .filter(at => at.task.completedAt === null)
        .sort((a, b) => {
          const deadlineA = a.task.deadline ? a.task.deadline.getTime() : Infinity;
          const deadlineB = b.task.deadline ? b.task.deadline.getTime() : Infinity;
          return deadlineA - deadlineB;
        });

      const completedTasks = assignedTasks
        .filter(at => at.task.completedAt !== null)
        .sort((a, b) => b.task.completedAt.getTime() - a.task.completedAt.getTime());

      const currentTask = pendingTasks[0]?.task || null;
      const taskHistory = [...pendingTasks.slice(1), ...completedTasks].map(at => at.task);

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
        taskHistory,
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

    const assignedTasks = member.assignedTasks;

    const pendingTasks = assignedTasks
      .filter(at => at.task.completedAt === null)
      .sort((a, b) => {
        const deadlineA = a.task.deadline ? a.task.deadline.getTime() : Infinity;
        const deadlineB = b.task.deadline ? b.task.deadline.getTime() : Infinity;
        return deadlineA - deadlineB;
      });

    const completedTasks = assignedTasks
      .filter(at => at.task.completedAt !== null)
      .sort((a, b) => b.task.completedAt.getTime() - a.task.completedAt.getTime());

    const currentTask = pendingTasks[0]?.task || null;
    const taskHistory = [...pendingTasks.slice(1), ...completedTasks].map(at => at.task);

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
      taskHistory,
    };
  }
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round(sum / values.length);
}