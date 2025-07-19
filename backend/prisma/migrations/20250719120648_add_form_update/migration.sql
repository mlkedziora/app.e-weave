-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "deadline" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ProjectAssignee" (
    "projectId" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,

    CONSTRAINT "ProjectAssignee_pkey" PRIMARY KEY ("projectId","teamMemberId")
);

-- AddForeignKey
ALTER TABLE "ProjectAssignee" ADD CONSTRAINT "ProjectAssignee_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignee" ADD CONSTRAINT "ProjectAssignee_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
