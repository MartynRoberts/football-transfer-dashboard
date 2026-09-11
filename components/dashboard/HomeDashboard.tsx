import Image from "next/image";
import TransferHistory from "@/components/players/TransferHistory";
import BestValueTransfers from "@/components/transfers/BestValueTransfers";
import MostEfficientClubSpending from "@/components/transfers/MostEfficientClubSpending";
import MostExpensiveTransfers from "@/components/transfers/MostExpensiveTransfers";
import TopClubSpenders from "@/components/transfers/TopClubSpenders";
import WorstValueTransfers from "@/components/transfers/WorstValueTransfers";
import type { getHomePageData } from "@/lib/dashboard/get-home-page-data";
import { TRANSFER_SEASON } from "@/lib/sync/scope";
import SectionNav from "@/components/navigation/SectionNav";

type HomeDashboardData = Awaited<ReturnType<typeof getHomePageData>>;

export default function HomeDashboard({ data }: { data: HomeDashboardData }) {
  return (
    <main className="home app-page page-stack">
      <section
        id="overview"
        className="section-anchor relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[url('/hero.jpg')] bg-cover bg-bottom text-white"
      >
        <div className="absolute inset-0 bg-slate-950/60" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[38rem] max-w-5xl flex-col items-center justify-start px-4 pt-28 pb-56 text-center sm:min-h-[44rem] sm:px-6 sm:pt-32 sm:pb-64 lg:min-h-[48rem] lg:pt-36">
          <div className="mb-5 flex items-center justify-center gap-0 sm:mb-6">
            <Image
              src="/images/logo3.png"
              alt=""
              width={56}
              height={56}
              sizes="(min-width: 768px) 56px, (min-width: 640px) 48px, 36px"
              preload
              className="size-9 shrink-0 object-contain sm:size-12 md:size-14"
            />
            <h1 className="font-[family-name:var(--font-ibm-plex-mono)] text-3xl font-thin tracking-tight text-shadow-lg sm:text-4xl md:text-5xl">
              TransferDashboard
            </h1>
          </div>
          <div
            className="mb-5 h-px w-12 bg-white/80 sm:mb-6 sm:w-16"
            aria-hidden="true"
          />
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-100 text-shadow-md sm:text-lg">
            Explore football transfer activity, squad valuations, net spend
            insights and league analytics for the top 5 leagues in Europe.
          </p>
        </div>
      </section>

      <SectionNav
        items={[
          { id: "overview", label: "Overview" },
          { id: "latest-transfers", label: "Latest transfers" },
          { id: "club-spending", label: "Club spending" },
          { id: "transfer-value", label: "Transfer value" },
          { id: "record-fees", label: "Record fees" },
        ]}
      />
      <div id="latest-transfers" className="section-anchor defer-offscreen">
        <TransferHistory
          transfers={data.latestTransfers}
          title="Latest transfers"
          showPlayer
        />
      </div>
      <div
        id="club-spending"
        className="section-anchor defer-offscreen mb-8 grid gap-8 sm:mb-12 lg:grid-cols-2"
      >
        <TopClubSpenders clubs={data.topSpenders} season={TRANSFER_SEASON} />
        <MostEfficientClubSpending
          clubs={data.mostEfficientClubs}
          seasons={data.efficiencySeasons}
        />
      </div>
      <div
        id="transfer-value"
        className="section-anchor defer-offscreen page-stack"
      >
        <BestValueTransfers
          transfers={data.bestValueTransfers}
          season={TRANSFER_SEASON}
        />
        <WorstValueTransfers
          transfers={data.worstValueTransfers}
          season={TRANSFER_SEASON}
        />
      </div>
      <div id="record-fees" className="section-anchor defer-offscreen">
        <MostExpensiveTransfers
          transfers={data.expensiveTransfers}
          season={TRANSFER_SEASON}
        />
      </div>
    </main>
  );
}
