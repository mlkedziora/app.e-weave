-- AlterTable
ALTER TABLE "MaterialHistory" ADD COLUMN     "taskId" TEXT;

-- AddForeignKey
ALTER TABLE "MaterialHistory" ADD CONSTRAINT "MaterialHistory_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
