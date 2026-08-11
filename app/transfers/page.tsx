import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Football Transfers",
  description:
    "Explore football transfer activity, fees and player movement across Europe's top five leagues.",
  path: "/transfers",
});

export default function TransfersPage() {
  return (
    <main className="app-page">
      <h1 className="page-title">Transfers</h1>
    </main>
  );
}
