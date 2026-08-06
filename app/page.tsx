import HomeDashboard from "@/components/dashboard/HomeDashboard";
import { getHomePageData } from "@/lib/dashboard/get-home-page-data";

export const revalidate = 60;

export default async function HomePage() {
  const data = await getHomePageData();

  return <HomeDashboard data={data} />;
}
