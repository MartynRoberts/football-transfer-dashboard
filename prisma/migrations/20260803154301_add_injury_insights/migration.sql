-- AlterTable
ALTER TABLE "PlayerMetric" ADD COLUMN     "careerInjuryGamesPercentage" DOUBLE PRECISION,
ADD COLUMN     "premierLeagueAvailabilityRank" INTEGER,
ADD COLUMN     "premierLeagueAvailabilityRankTotal" INTEGER,
ADD COLUMN     "recurrentInjuryCount" INTEGER,
ADD COLUMN     "recurrentInjuryGroup" TEXT,
ADD COLUMN     "recurrentInjuryWarning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seasonInjuryGamesPercentage" DOUBLE PRECISION,
ADD COLUMN     "topFiveAvailabilityRank" INTEGER,
ADD COLUMN     "topFiveAvailabilityRankTotal" INTEGER;
