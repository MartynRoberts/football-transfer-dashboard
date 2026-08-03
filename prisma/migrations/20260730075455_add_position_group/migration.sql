/*
  Warnings:

  - A unique constraint covering the columns `[playerId,competitionId,season,clubId]` on the table `PlayerStat` will be added. If there are existing duplicate values, this will fail.
  - Made the column `season` on table `PlayerStat` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_season_fkey";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "positionGroup" TEXT,
ADD COLUMN     "profileSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PlayerStat" ALTER COLUMN "season" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStat_playerId_competitionId_season_clubId_key" ON "PlayerStat"("playerId", "competitionId", "season", "clubId");
