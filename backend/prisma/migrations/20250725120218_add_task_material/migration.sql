-- CreateTable
CREATE TABLE "TaskMaterial" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "amountUsed" DOUBLE PRECISION NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskMaterial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskMaterial" ADD CONSTRAINT "TaskMaterial_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMaterial" ADD CONSTRAINT "TaskMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
