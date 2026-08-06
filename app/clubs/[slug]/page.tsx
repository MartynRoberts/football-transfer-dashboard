import { Suspense } from "react";
import { notFound } from "next/navigation";
import ClubAvailabilitySection, {
  ClubAvailabilitySkeleton,
} from "@/components/clubs/ClubAvailabilitySection";
import ClubSummary from "@/components/clubs/ClubSummary";
import ClubTransferTable from "@/components/clubs/ClubTransferTable";
import SquadMembers from "@/components/clubs/SquadMembers";
import SquadPositionCounts from "@/components/clubs/SquadPositionCounts";
import SquadPyramids from "@/components/clubs/SquadPyramids";
import {
  formatNetSpend,
  getLastThreeSeasons,
} from "@/lib/clubs/transfer-summary";
import { prisma } from "@/lib/prisma";
import { CURRENT_SEASON, TRANSFER_SEASON } from "@/lib/sync/scope";

export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      league: true,
      players: {
        orderBy: [
          { shirtNumber: { sort: "asc", nulls: "last" } },
          { name: "asc" },
        ],
      },
      incomingTransfers: {
        where: { season: TRANSFER_SEASON },
        include: { player: true, fromClub: true },
        orderBy: { transferDate: "desc" },
        take: 10,
      },
      outgoingTransfers: {
        where: { season: TRANSFER_SEASON },
        include: { player: true, toClub: true },
        orderBy: { transferDate: "desc" },
        take: 10,
      },
      _count: {
        select: {
          players: true,
          incomingTransfers: { where: { season: TRANSFER_SEASON } },
          outgoingTransfers: { where: { season: TRANSFER_SEASON } },
        },
      },
    },
  });

  if (!club) notFound();

  const lastThreeTransferSeasons = getLastThreeSeasons(TRANSFER_SEASON);
  const [
    currentSeasonIncoming,
    currentSeasonOutgoing,
    threeYearIncoming,
    threeYearOutgoing,
  ] = await Promise.all([
    prisma.transfer.aggregate({
      where: { toClubId: club.id, season: TRANSFER_SEASON, fee: { not: null } },
      _sum: { fee: true },
    }),
    prisma.transfer.aggregate({
      where: {
        fromClubId: club.id,
        season: TRANSFER_SEASON,
        fee: { not: null },
      },
      _sum: { fee: true },
    }),
    prisma.transfer.aggregate({
      where: {
        toClubId: club.id,
        season: { in: lastThreeTransferSeasons },
        fee: { not: null },
      },
      _sum: { fee: true },
    }),
    prisma.transfer.aggregate({
      where: {
        fromClubId: club.id,
        season: { in: lastThreeTransferSeasons },
        fee: { not: null },
      },
      _sum: { fee: true },
    }),
  ]);

  const currentNetSpend = formatNetSpend(
    (currentSeasonIncoming._sum.fee ?? 0) -
      (currentSeasonOutgoing._sum.fee ?? 0),
  );
  const threeYearNetSpend = formatNetSpend(
    (threeYearIncoming._sum.fee ?? 0) - (threeYearOutgoing._sum.fee ?? 0),
  );
  const summaryMetrics = [
    { label: "Squad Size", value: club._count.players },
    { label: "Arrivals", value: club._count.incomingTransfers },
    { label: "Departures", value: club._count.outgoingTransfers },
    {
      label: "Net spend this season",
      value: currentNetSpend.value,
      detail: currentNetSpend.detail,
    },
    {
      label: "Net spend — last 3 seasons",
      value: threeYearNetSpend.value,
      detail: threeYearNetSpend.detail,
    },
  ];

  return (
    <main className="app-page page-stack">
      <ClubSummary club={club} metrics={summaryMetrics} />
      <ClubTransferTable
        direction="incoming"
        transfers={club.incomingTransfers}
      />
      <ClubTransferTable
        direction="outgoing"
        transfers={club.outgoingTransfers}
      />
      <SquadPositionCounts players={club.players} />
      <SquadPyramids players={club.players} />
      {club.leagueId && (
        <Suspense fallback={<ClubAvailabilitySkeleton />}>
          <ClubAvailabilitySection
            clubId={club.id}
            leagueId={club.leagueId}
            leagueName={club.league?.name ?? "League"}
            season={CURRENT_SEASON}
          />
        </Suspense>
      )}
      <SquadMembers players={club.players} />
    </main>
  );
}
