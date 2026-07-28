/*
  Warnings:

  - Made the column `description` on table `Injury` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `Injury` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Injury_playerId_idx";

-- AlterTable
ALTER TABLE "Injury" ADD COLUMN     "days" INTEGER,
ADD COLUMN     "gamesMissed" INTEGER,
ADD COLUMN     "season" TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "startDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "clubRank" INTEGER,
ADD COLUMN     "leagueRank" INTEGER,
ADD COLUMN     "marketValue" INTEGER,
ADD COLUMN     "positionRank" INTEGER,
ADD COLUMN     "worldwideRank" INTEGER;

-- CreateTable
CREATE TABLE "MarketValueHistory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "age" INTEGER,
    "marketValue" INTEGER NOT NULL,
    "clubName" TEXT,

    CONSTRAINT "MarketValueHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketValueHistory_playerId_idx" ON "MarketValueHistory"("playerId");

-- CreateIndex
CREATE INDEX "MarketValueHistory_date_idx" ON "MarketValueHistory"("date");

-- AddForeignKey
ALTER TABLE "MarketValueHistory" ADD CONSTRAINT "MarketValueHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
