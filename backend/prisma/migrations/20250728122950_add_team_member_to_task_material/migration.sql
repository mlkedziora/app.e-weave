-- AlterTable
ALTER TABLE "TaskMaterial" ADD COLUMN     "teamMemberId" TEXT;

-- AddForeignKey
ALTER TABLE "TaskMaterial" ADD CONSTRAINT "TaskMaterial_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
