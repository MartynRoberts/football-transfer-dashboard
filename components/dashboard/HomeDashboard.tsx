import TransferHistory from "@/components/players/TransferHistory";
import BestValueTransfers from "@/components/transfers/BestValueTransfers";
import MostEfficientClubSpending from "@/components/transfers/MostEfficientClubSpending";
import MostExpensiveTransfers from "@/components/transfers/MostExpensiveTransfers";
import TopClubSpenders from "@/components/transfers/TopClubSpenders";
import WorstValueTransfers from "@/components/transfers/WorstValueTransfers";
import type { getHomePageData } from "@/lib/dashboard/get-home-page-data";
import { TRANSFER_SEASON } from "@/lib/sync/scope";

type HomeDashboardData = Awaited<ReturnType<typeof getHomePageData>>;

export default function HomeDashboard({ data }: { data: HomeDashboardData }) {
  return (
    <main className="container mx-auto space-y-8 px-3 py-4 sm:space-y-10 sm:px-4 sm:py-8">
      <section
        className="mb-8 rounded-xl px-4 py-8 text-center text-white shadow-lg sm:mb-12 sm:rounded-2xl sm:px-6 sm:py-10"
        style={{
          backgroundColor: "#000000",
          backgroundImage:
            "linear-gradient(90deg, rgba(0, 0, 0, 1) 0%, rgba(7, 81, 117, 1) 50%, rgba(0, 0, 0, 1) 100%)",
        }}
      >
        <h1 className="mb-3 font-[family-name:var(--font-ibm-plex-mono)] text-3xl font-thin tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">
          TransferDashboard
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Explore football transfer activity, squad valuations, net spend
          insights, and league analytics.
        </p>
      </section>

      <TransferHistory
        transfers={data.latestTransfers}
        title="Latest transfers — top five leagues"
        showPlayer
      />
      <div className="mb-8 grid gap-8 sm:mb-12 lg:grid-cols-2">
        <TopClubSpenders clubs={data.topSpenders} season={TRANSFER_SEASON} />
        <MostEfficientClubSpending
          clubs={data.mostEfficientClubs}
          seasons={data.efficiencySeasons}
        />
      </div>
      <BestValueTransfers
        transfers={data.bestValueTransfers}
        season={TRANSFER_SEASON}
      />
      <WorstValueTransfers
        transfers={data.worstValueTransfers}
        season={TRANSFER_SEASON}
      />
      <MostExpensiveTransfers
        transfers={data.expensiveTransfers}
        season={TRANSFER_SEASON}
      />
    </main>
  );
}
