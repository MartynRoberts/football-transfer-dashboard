import { notFound } from "next/navigation";

import AppearanceMetrics from "@/components/players/AppearanceMetrics";
import GoalsAndAssists from "@/components/players/GoalsAndAssists";
import InjuryHistory from "@/components/players/InjuryHistory";
import MarketValueHistory from "@/components/players/MarketValueHistory";
import PlayerHeader from "@/components/players/PlayerHeader";
import TransferHistory from "@/components/players/TransferHistory";
import { getPlayerPageData } from "@/lib/players/get-player-page-data";

interface PlayerPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const data = await getPlayerPageData(slug);

  if (!data) {
    notFound();
  }

  const { player } = data;

  return (
    <main className="app-page page-stack">
      <PlayerHeader
        player={player}
        secondaryPositions={data.secondaryPositions}
      />
      <AppearanceMetrics metric={player.metric} />
      <GoalsAndAssists seasons={data.seasonPerformances} />
      <TransferHistory transfers={player.transfers} />
      <MarketValueHistory
        histories={player.marketValueHistories}
        chartData={data.marketValueChartData}
        metric={player.metric}
        leagueName={player.currentClub?.league?.name ?? null}
        position={player.position}
      />
      <InjuryHistory injuries={player.injuries} metric={player.metric} />
    </main>
  );
}
