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
    const org = await this.clerkClient.organizations.create({
      name: dto.name,
      createdBy: userId, // Admin/creator
    });

    // Update Prisma with clerkOrgId
    const updatedTeam = await this.prisma.team.update({
      where: { id: team.id },
      data: { clerkOrgId: org.id },
    });

    // Add creator as admin member (adjust name/email fetch as needed, e.g., from Clerk)
    const adminUser = await this.clerkClient.users.get(userId); // Fetch details
    await this.prisma.teamMember.create({
      data: {
        userId,
        email: adminUser.primaryEmailAddress?.emailAddress, // Or dto if provided
        name: adminUser.fullName || 'Admin', // Fallback
        role: 'admin',
        position: 'Admin', // Adjust
        teamId: team.id,
        startDate: new Date(),
      },
    });

    // Update user's metadata for auth
    await this.clerkClient.users.update(userId, {
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