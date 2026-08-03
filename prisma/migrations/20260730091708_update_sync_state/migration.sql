/*
  Warnings:

  - You are about to drop the column `syncSeason` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `syncedAt` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `syncSeason` on the `League` table. All the data in the column will be lost.
  - You are about to drop the column `syncedAt` on the `League` table. All the data in the column will be lost.
  - You are about to drop the column `injuriesSyncedAt` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `squadSyncedAt` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `statsSyncedAt` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Club" DROP COLUMN "syncSeason",
DROP COLUMN "syncedAt";

-- AlterTable
ALTER TABLE "League" DROP COLUMN "syncSeason",
DROP COLUMN "syncedAt";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "injuriesSyncedAt",
DROP COLUMN "squadSyncedAt",
DROP COLUMN "statsSyncedAt";

-- CreateTable
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "season" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SyncState_entityType_syncType_season_idx" ON "SyncState"("entityType", "syncType", "season");

-- CreateIndex
CREATE UNIQUE INDEX "SyncState_entityType_entityId_syncType_season_key" ON "SyncState"("entityType", "entityId", "syncType", "season");
