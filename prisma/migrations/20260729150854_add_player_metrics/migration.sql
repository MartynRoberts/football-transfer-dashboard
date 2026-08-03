-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "transfermarktId" TEXT,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "transfermarktId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "leagueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "transfermarktId" TEXT,
    "slug" TEXT NOT NULL,
    "shirtNumber" INTEGER,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "position" TEXT,
    "secondaryPositions" JSONB,
    "nationality" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "foot" TEXT,
    "height" INTEGER,
    "contract" TIMESTAMP(3),
    "joinedOn" TIMESTAMP(3),
    "currentClubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "marketValue" INTEGER,
    "worldwideRank" INTEGER,
    "leagueRank" INTEGER,
    "clubRank" INTEGER,
    "positionRank" INTEGER,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStat" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "competitionId" TEXT,
    "competitionName" TEXT NOT NULL,
    "season" TEXT,
    "clubId" TEXT,
    "appearances" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMetric" (
    "playerId" TEXT NOT NULL,
    "currentMarketValue" INTEGER,
    "previousMarketValue" INTEGER,
    "marketValueChange" INTEGER,
    "marketValueChangePct" DOUBLE PRECISION,
    "worldwideValueRank" INTEGER,
    "leagueValueRank" INTEGER,
    "clubValueRank" INTEGER,
    "positionValueRank" INTEGER,
    "appearances" INTEGER,
    "minutesPlayed" INTEGER,
    "clubMinutesRank" INTEGER,
    "leagueMinutesRank" INTEGER,
    "positionMinutesRank" INTEGER,
    "goals" INTEGER,
    "assists" INTEGER,
    "clubGoalsRank" INTEGER,
    "leagueGoalsRank" INTEGER,
    "positionGoalsRank" INTEGER,
    "clubAssistsRank" INTEGER,
    "leagueAssistsRank" INTEGER,
    "positionAssistsRank" INTEGER,
    "yellowCards" INTEGER,
    "redCards" INTEGER,
    "careerInjuries" INTEGER,
    "careerGamesMissed" INTEGER,
    "careerDaysInjured" INTEGER,
    "seasonDaysInjured" INTEGER,
    "seasonGamesMissed" INTEGER,
    "injuryProneScore" DOUBLE PRECISION,
    "clubInjuryRank" INTEGER,
    "leagueInjuryRank" INTEGER,
    "heightPercentileOverall" DOUBLE PRECISION,
    "heightPercentilePosition" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerMetric_pkey" PRIMARY KEY ("playerId")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "transfermarktId" TEXT,
    "playerId" TEXT NOT NULL,
    "fromClubId" TEXT,
    "toClubId" TEXT,
    "season" TEXT,
    "fee" INTEGER,
    "marketValue" INTEGER,
    "upcoming" BOOLEAN NOT NULL DEFAULT false,
    "transferDate" TIMESTAMP(3),
    "transferType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketValue" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketValue_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Injury" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "season" TEXT,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expectedReturn" TIMESTAMP(3),
    "days" INTEGER,
    "gamesMissed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Injury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "League_transfermarktId_key" ON "League"("transfermarktId");

-- CreateIndex
CREATE UNIQUE INDEX "League_slug_key" ON "League"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Club_transfermarktId_key" ON "Club"("transfermarktId");

-- CreateIndex
CREATE UNIQUE INDEX "Club_slug_key" ON "Club"("slug");

-- CreateIndex
CREATE INDEX "Club_leagueId_idx" ON "Club"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_transfermarktId_key" ON "Player"("transfermarktId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

-- CreateIndex
CREATE INDEX "Player_currentClubId_idx" ON "Player"("currentClubId");

-- CreateIndex
CREATE INDEX "PlayerStat_playerId_idx" ON "PlayerStat"("playerId");

-- CreateIndex
CREATE INDEX "PlayerStat_season_idx" ON "PlayerStat"("season");

-- CreateIndex
CREATE INDEX "PlayerStat_competitionId_idx" ON "PlayerStat"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_name_key" ON "Season"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_transfermarktId_key" ON "Transfer"("transfermarktId");

-- CreateIndex
CREATE INDEX "Transfer_playerId_idx" ON "Transfer"("playerId");

-- CreateIndex
CREATE INDEX "Transfer_fromClubId_idx" ON "Transfer"("fromClubId");

-- CreateIndex
CREATE INDEX "Transfer_toClubId_idx" ON "Transfer"("toClubId");

-- CreateIndex
CREATE INDEX "Transfer_season_idx" ON "Transfer"("season");

-- CreateIndex
CREATE INDEX "MarketValue_playerId_idx" ON "MarketValue"("playerId");

-- CreateIndex
CREATE INDEX "MarketValue_capturedAt_idx" ON "MarketValue"("capturedAt");

-- CreateIndex
CREATE INDEX "MarketValueHistory_playerId_idx" ON "MarketValueHistory"("playerId");

-- CreateIndex
CREATE INDEX "MarketValueHistory_date_idx" ON "MarketValueHistory"("date");

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_currentClubId_fkey" FOREIGN KEY ("currentClubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStat" ADD CONSTRAINT "PlayerStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMetric" ADD CONSTRAINT "PlayerMetric_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromClubId_fkey" FOREIGN KEY ("fromClubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_season_fkey" FOREIGN KEY ("season") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toClubId_fkey" FOREIGN KEY ("toClubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketValue" ADD CONSTRAINT "MarketValue_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketValueHistory" ADD CONSTRAINT "MarketValueHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Injury" ADD CONSTRAINT "Injury_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
