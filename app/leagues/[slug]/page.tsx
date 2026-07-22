export default async function LeaguePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">{slug}</h1>
    </main>
  );
}
