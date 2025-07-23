// backend/src/member/member.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createClerkClient } from '@clerk/backend';  // Updated import
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
  private clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });  // Updated initialization

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamMemberDto, userId: string, image?: Express.Multer.File) { 
    if (!userId) throw new Error('User ID required for team member creation');

    // Get admin's team (assume req.user.teamId is set in middleware; fallback to query if needed)
    const adminTeamMember = await this.prisma.teamMember.findFirst({ where: { userId } });
    const teamId = adminTeamMember.teamId;
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team?.clerkOrgId) throw new Error('Team not synced with Clerk organization');

    // Create pending DB entry
    const data: Prisma.TeamMemberCreateInput = {
      name: dto.name,
      email: dto.email,  // New: For webhook matching
      position: dto.position,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      userId: null,  // Pending
      teamId,
      imageUrl: image ? `/uploads/${image.filename}` : null,
      role: 'member',  // Default; add to DTO/form if customizable
    };

    const member = await this.prisma.teamMember.create({ data });

    if (dto.projectIds?.length) {
      await this.prisma.projectAssignee.createMany({
        data: dto.projectIds.map((projectId) => ({ projectId, teamMemberId: member.id })),
        skipDuplicates: true,
      });
    }

    // Send Clerk organization invitation
    const invitation = await this.clerkClient.organizations.createOrganizationInvitation({
      organizationId: team.clerkOrgId,  // Use synced ID
      emailAddress: dto.email,
      inviterUserId: userId,
      role: 'org:member',
      publicMetadata: { role: 'member', teamId },
      redirectUrl: 'http://localhost:5173/sign-up',  // Adjust for prod
    });

    console.log(`Invitation sent to ${dto.email}: ${invitation.publicInvitationUrl}`);

    return member;
  }

  // Updated: Handle Clerk webhook for membership created
  async handleClerkWebhook(payload: any) {
    if (payload.type === 'organizationMembership.created') {
      const { user_id, organization_id } = payload.data;

      // Get user details from Clerk
      const user = await this.clerkClient.users.get(user_id);
      const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
      if (!email) {
        console.error('No primary email found for user');
        return { success: false };
      }

      // Find matching team via clerkOrgId
      const team = await this.prisma.team.findFirst({ where: { clerkOrgId: organization_id } });
      if (!team) {
        console.error('No team found for organization');
        return { success: false };
      }

      // Find pending member by email and team
      const member = await this.prisma.teamMember.findFirst({
        where: { email, userId: null, teamId: team.id },
      });
      if (!member) {
        console.error('No pending member found');
        return { success: false };
      }

      // Update member
      await this.prisma.teamMember.update({
        where: { id: member.id },
        data: { userId: user_id, email: null }, // Clear email
      });

      // Set user's publicMetadata (for auth middleware)
      await this.clerkClient.users.update(user_id, {
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