import HomeDashboard from "@/components/dashboard/HomeDashboard";
import { getHomePageData } from "@/lib/dashboard/get-home-page-data";
import { createPageMetadata } from "@/lib/seo/metadata";

const homeMetadata = createPageMetadata({
  title: "Football Transfer Analytics",
  description:
    "Analyse football transfers, fees, market values and club spending across Europe's top five leagues.",
  path: "/",
});

export const metadata = {
  ...homeMetadata,
  title: { absolute: "Football Transfer Analytics | TransferDashboard" },
};

export const revalidate = 60;

export default async function HomePage() {
  const data = await getHomePageData();

  return <HomeDashboard data={data} />;
}
