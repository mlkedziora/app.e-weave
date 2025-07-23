// backend/src/prisma/sync-clerk-org.ts
import { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/backend';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function syncTeam(teamId: string, teamName: string, adminUserId: string) {
  // Create Clerk org
  const org = await clerkClient.organizations.createOrganization({
    name: teamName,
    createdBy: adminUserId,
  });

  // Update DB
  await prisma.team.update({
    where: { id: teamId },
    data: { clerkOrgId: org.id },
  });

  // Add admin to org
  await clerkClient.organizations.createOrganizationMembership({
    organizationId: org.id,
    userId: adminUserId,
    role: 'org:admin',
  });

  console.log(`Synced team ${teamId} with Clerk org ${org.id}`);
}

async function main() {
  // Replace with your values (teamId is Prisma ID, not Clerk org ID)
  await syncTeam('cmda9pqtq00003rzgxttvjzxq', 'SFTC', 'user_2zPs2klPU4dIx3dhTpEij5t8Jkq');
}

main().catch(console.error).finally(() => prisma.$disconnect());