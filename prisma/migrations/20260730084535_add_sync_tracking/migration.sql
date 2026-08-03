-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "syncSeason" TEXT,
ADD COLUMN     "syncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "League" ADD COLUMN     "syncSeason" TEXT,
ADD COLUMN     "syncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "injuriesSyncedAt" TIMESTAMP(3),
ADD COLUMN     "squadSyncedAt" TIMESTAMP(3),
ADD COLUMN     "statsSyncedAt" TIMESTAMP(3);
