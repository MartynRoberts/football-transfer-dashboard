import { Suspense } from "react";
import type { Metadata } from "next";
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
import { createPageMetadata } from "@/lib/seo/metadata";
import SectionNav from "@/components/navigation/SectionNav";

interface ClubPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ClubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = await prisma.club.findUnique({
    where: { slug },
    select: {
      name: true,
      logoUrl: true,
      league: { select: { name: true } },
    },
  });

  if (!club) {
    return { title: "Club not found", robots: { index: false } };
  }

  const leagueName = club.league?.name ?? "European football";

  return createPageMetadata({
    title: `${club.name} Transfers, Squad & Statistics`,
    description: `Explore ${club.name} transfers, squad details, net spend and availability analytics in ${leagueName}.`,
    path: `/clubs/${slug}`,
    image: club.logoUrl,
  });
}

export default async function ClubPage({
  params,
}: ClubPageProps) {
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
        include: { player: true, fromClub: true, toClub: true },
        orderBy: { transferDate: "desc" },
        take: 10,
      },
      outgoingTransfers: {
        where: { season: TRANSFER_SEASON },
        include: { player: true, fromClub: true, toClub: true },
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
  const sectionNav = (
    <SectionNav
      items={[
        { id: "overview", label: "Overview" },
        { id: "incoming", label: "Incoming" },
        { id: "outgoing", label: "Outgoing" },
        { id: "squad-profile", label: "Squad profile" },
        ...(club.leagueId
          ? [{ id: "availability", label: "Availability" }]
          : []),
        { id: "players", label: "Players" },
      ]}
    />
  );

  return (
    <main className="app-page page-stack">
      <ClubSummary
        club={club}
        metrics={summaryMetrics}
        navigation={sectionNav}
      />
      <div id="incoming" className="section-anchor">
        <ClubTransferTable
          direction="incoming"
          transfers={club.incomingTransfers}
        />
      </div>
      <div id="outgoing" className="section-anchor">
        <ClubTransferTable
          direction="outgoing"
          transfers={club.outgoingTransfers}
        />
      </div>
      <div id="squad-profile" className="section-anchor page-stack">
        <SquadPositionCounts players={club.players} />
        <SquadPyramids players={club.players} />
      </div>
      {club.leagueId && (
        <div id="availability" className="section-anchor">
          <Suspense fallback={<ClubAvailabilitySkeleton />}>
            <ClubAvailabilitySection
              clubId={club.id}
              leagueId={club.leagueId}
              leagueName={club.league?.name ?? "League"}
              season={CURRENT_SEASON}
            />
          </Suspense>
        </div>
      )}
      <div id="players" className="section-anchor">
        <SquadMembers players={club.players} />
      </div>
    </main>
  );
}
