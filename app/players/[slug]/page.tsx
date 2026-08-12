import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AppearanceMetrics from "@/components/players/AppearanceMetrics";
import GoalsAndAssists from "@/components/players/GoalsAndAssists";
import InjuryHistory from "@/components/players/InjuryHistory";
import MarketValueHistory from "@/components/players/MarketValueHistory";
import PlayerHeader from "@/components/players/PlayerHeader";
import TransferHistory from "@/components/players/TransferHistory";
import SectionNav from "@/components/navigation/SectionNav";
import PlayerDiscipline from "@/components/players/PlayerDiscipline";
import { getPlayerPageData } from "@/lib/players/get-player-page-data";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/lib/seo/metadata";

interface PlayerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const player = await prisma.player.findUnique({
    where: { slug },
    select: {
      name: true,
      position: true,
      imageUrl: true,
      currentClub: {
        select: {
          name: true,
          league: { select: { name: true } },
        },
      },
    },
  });

  if (!player) {
    return { title: "Player not found", robots: { index: false } };
  }

  const clubName = player.currentClub?.name ?? "their current club";
  const leagueName = player.currentClub?.league?.name;

  return createPageMetadata({
    title: `${player.name} Transfers, Stats & Market Value`,
    description: `View ${player.name}'s transfer history, market value, injuries and ${player.position ?? "player"} statistics for ${clubName}${leagueName ? ` in ${leagueName}` : ""}.`,
    path: `/players/${slug}`,
    image: player.imageUrl,
  });
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const data = await getPlayerPageData(slug);

  if (!data) {
    notFound();
  }

  const { player } = data;
  const sectionNav = (
    <SectionNav
      items={[
        { id: "overview", label: "Overview" },
        { id: "market-value", label: "Market value" },
        { id: "appearances", label: "Appearances" },
        { id: "performance", label: "Goals & assists" },
        { id: "discipline", label: "Discipline" },
        { id: "injuries", label: "Injuries" },
        { id: "transfers", label: "Transfers" },
      ]}
    />
  );

  return (
    <main className="app-page page-stack min-w-0 overflow-x-clip">
      <PlayerHeader
        player={player}
        secondaryPositions={data.secondaryPositions}
        navigation={sectionNav}
      />
      <div id="market-value" className="section-anchor">
        <MarketValueHistory
          histories={player.marketValueHistories}
          chartData={data.marketValueChartData}
          metric={player.metric}
          leagueName={player.currentClub?.league?.name ?? null}
          position={player.position}
        />
      </div>
      <div id="appearances" className="section-anchor">
        <AppearanceMetrics metric={player.metric} />
      </div>
      <div id="performance" className="section-anchor">
        <GoalsAndAssists seasons={data.seasonPerformances} />
      </div>
      <div id="discipline" className="section-anchor">
        <PlayerDiscipline seasons={data.seasonPerformances} />
      </div>
      <div id="injuries" className="section-anchor">
        <InjuryHistory injuries={player.injuries} metric={player.metric} />
      </div>
      <div id="transfers" className="section-anchor">
        <TransferHistory transfers={player.transfers} />
      </div>
    </main>
  );
}
