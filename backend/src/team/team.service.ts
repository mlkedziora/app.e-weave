// backend/src/team/team.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createClerkClient } from '@clerk/backend';
import { CreateTeamDto } from './dto/create-team.dto.js';

@Injectable()
export class TeamService {
  private clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamDto, userId: string) {
    if (!userId) throw new Error('User ID required for team creation');

    // Create Prisma team
    const team = await this.prisma.team.create({
      data: { name: dto.name },
    });

    // Create Clerk organization and sync
    const org = await this.clerkClient.organizations.createOrganization({ // Fixed
      name: dto.name,
      createdBy: userId,
    });

    // Update Prisma with clerkOrgId
    const updatedTeam = await this.prisma.team.update({
      where: { id: team.id },
      data: { clerkOrgId: org.id },
    });

    // Add creator as admin member
    const adminUser = await this.clerkClient.users.getUser(userId); // Fixed
    await this.prisma.teamMember.create({
      data: {
        userId,
        email: adminUser.primaryEmailAddress?.emailAddress,
        name: adminUser.fullName || 'Admin',
        role: 'admin',
        position: 'Admin',
        teamId: team.id,
        startDate: new Date(),
      },
    });

    // Update user's metadata
    await this.clerkClient.users.updateUser(userId, { // Fixed
      publicMetadata: { role: 'admin', teamId: team.id },
    });

    // Join the org as admin
    await this.clerkClient.organizations.createOrganizationMembership({
      organizationId: org.id,
      userId,
      role: 'org:admin',
    });

    return updatedTeam;
  }
}