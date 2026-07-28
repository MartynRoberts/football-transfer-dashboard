import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      league: true,

      players: {
        orderBy: {
          name: "asc",
        },
      },

      outgoingTransfers: {
        include: {
          player: true,
          toClub: true,
        },
        orderBy: {
          transferDate: "desc",
        },
        take: 10,
      },

      incomingTransfers: {
        include: {
          player: true,
          fromClub: true,
        },
        orderBy: {
          transferDate: "desc",
        },
        take: 10,
      },

      _count: {
        select: {
          players: true,
          outgoingTransfers: true,
          incomingTransfers: true,
        },
      },
    },
  });

  if (!club) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <section>
        <h1 className="text-4xl font-bold">{club.name}</h1>

        {club.league && (
          <Link
            href={`/leagues/${club.league.slug}`}
            className="text-blue-600 hover:underline"
          >
            {club.league.name}
          </Link>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Squad Size</p>
            <p className="text-2xl font-bold">{club._count.players}</p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Arrivals</p>
            <p className="text-2xl font-bold">
              {club._count.incomingTransfers}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Departures</p>
            <p className="text-2xl font-bold">
              {club._count.outgoingTransfers}
            </p>
          </div>
        </div>
      </section>

      {/* Squad */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Squad</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {club.players.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="border rounded-lg p-4 hover:border-blue-500"
            >
              <p className="font-semibold">{player.name}</p>

              <p className="text-sm text-gray-500">
                {player.position ?? "Unknown"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Incoming Transfers */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Incoming Transfers</h2>

        {club.incomingTransfers.length === 0 ? (
          <p className="text-gray-500">No incoming transfers.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Player</th>

                <th className="p-3 text-left">From</th>

                <th className="p-3 text-left">Fee</th>
              </tr>
            </thead>

            <tbody>
              {club.incomingTransfers.map((transfer) => (
                <tr key={transfer.id} className="border-b">
                  <td className="p-3">
                    <Link
                      href={`/players/${transfer.player.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {transfer.player.name}
                    </Link>
                  </td>

                  <td className="p-3">
                    {transfer.fromClub?.name ?? "Free Agent"}
                  </td>

                  <td className="p-3">
                    {transfer.fee
                      ? `€${transfer.fee.toLocaleString()}`
                      : "Free"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Outgoing Transfers */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Outgoing Transfers</h2>

        {club.outgoingTransfers.length === 0 ? (
          <p className="text-gray-500">No outgoing transfers.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Player</th>

                <th className="p-3 text-left">To</th>

                <th className="p-3 text-left">Fee</th>
              </tr>
            </thead>

            <tbody>
              {club.outgoingTransfers.map((transfer) => (
                <tr key={transfer.id} className="border-b">
                  <td className="p-3">
                    <Link
                      href={`/players/${transfer.player.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {transfer.player.name}
                    </Link>
                  </td>

                  <td className="p-3">
                    {transfer.toClub?.name ?? "Free Agent"}
                  </td>

                  <td className="p-3">
                    {transfer.fee
                      ? `€${transfer.fee.toLocaleString()}`
                      : "Free"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
