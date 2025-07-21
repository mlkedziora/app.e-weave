/*
  Warnings:

  - A unique constraint covering the columns `[name,teamId]` on the table `MaterialCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MaterialCategory_name_teamId_key" ON "MaterialCategory"("name", "teamId");
