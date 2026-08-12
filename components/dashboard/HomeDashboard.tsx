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
    <main className="app-page page-stack">
      <section
        id="overview"
        className="section-anchor px-4 py-8 text-center sm:px-6 sm:py-10"
      >
        <Image
          src="/images/logo.png"
          alt=""
          width={120}
          height={120}
          className="rounded-lg object-cover h-full block mx-auto"
        />
        <h1 className="mb-3 font-[family-name:var(--font-ibm-plex-mono)] text-3xl font-thin tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">
          TransferDashboard
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
          Explore football transfer activity, squad valuations, net spend
          insights and league analytics for the top 5 leagues in Europe.
        </p>
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
      <div id="latest-transfers" className="section-anchor">
        <TransferHistory
          transfers={data.latestTransfers}
          title="Latest transfers"
          showPlayer
        />
      </div>
      <div
        id="club-spending"
        className="section-anchor mb-8 grid gap-8 sm:mb-12 lg:grid-cols-2"
      >
        <TopClubSpenders clubs={data.topSpenders} season={TRANSFER_SEASON} />
        <MostEfficientClubSpending
          clubs={data.mostEfficientClubs}
          seasons={data.efficiencySeasons}
        />
      </div>
      <div id="transfer-value" className="section-anchor page-stack">
        <BestValueTransfers
          transfers={data.bestValueTransfers}
          season={TRANSFER_SEASON}
        />
        <WorstValueTransfers
          transfers={data.worstValueTransfers}
          season={TRANSFER_SEASON}
        />
      </div>
      <div id="record-fees" className="section-anchor">
        <MostExpensiveTransfers
          transfers={data.expensiveTransfers}
          season={TRANSFER_SEASON}
        />
      </div>
    </main>
  );
}
