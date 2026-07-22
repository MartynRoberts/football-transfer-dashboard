/*
  Warnings:

  - You are about to drop the column `error` on the `SyncLog` table. All the data in the column will be lost.
  - You are about to drop the column `records` on the `SyncLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SyncLog" DROP COLUMN "error",
DROP COLUMN "records",
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "recordsCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recordsUpdated" INTEGER NOT NULL DEFAULT 0;
