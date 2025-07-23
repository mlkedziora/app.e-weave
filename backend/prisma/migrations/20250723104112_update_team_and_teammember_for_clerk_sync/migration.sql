-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "clerkOrgId" TEXT;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "email" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;
