export default async function TransfersPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">{slug}</h1>
    </main>
  );
}
