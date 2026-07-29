import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

import Image from "next/image";

interface PlayerPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;

  const player = await prisma.player.findUnique({
    where: {
      slug,
    },
    include: {
      currentClub: true,
      transfers: {
        include: {
          fromClub: true,
          toClub: true,
          season: true,
        },
        orderBy: {
          transferDate: "desc",
        },
      },
      marketValues: {
        orderBy: {
          capturedAt: "desc",
        },
      },
      injuries: {
        orderBy: {
          startDate: "desc",
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  const latestMarketValue = player.marketValues[0];

  return (
    <main className="container mx-auto px-4 py-8 space-y-10">
      <div className="flex justify-between">
        <section className="flex items-center gap-6">
          {player.imageUrl && (
            <Image
              src={player.imageUrl}
              alt={player.name}
              width={180}
              height={240}
              className="rounded-lg object-cover"
            />
          )}

          <div>
            <h1 className="text-4xl font-bold">{player.name}</h1>

            <p className="text-gray-500 mt-2">
              {player.position ?? "Unknown position"}
              {player.secondaryPositions ??
                player.secondaryPositions.map((position) => (
                  <p key={position} className="text-sm text-slate-500">
                    {position}
                  </p>
                ))}
            </p>
          </div>
        </section>

        {/* Club / contract */}
        <section className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Current Club</div>

            {player.currentClub ? (
              <Link
                href={`/clubs/${player.currentClub.slug}`}
                className="text-blue-600 hover:underline text-xl font-semibold"
              >
                {player.currentClub.name}
              </Link>
            ) : (
              "-"
            )}
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Contract Until</div>

            <div className="text-xl font-semibold">
              {player.contract ? player.contract.toLocaleDateString() : "-"}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Joined Club</div>

            <div className="text-xl font-semibold">
              {player.joinedOn ? player.joinedOn.toLocaleDateString() : "-"}
            </div>
          </div>
        </section>
      </div>

      {/* Profile cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Nationality</div>
          <div className="text-xl font-semibold">
            {player.nationality ?? "-"}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Preferred Foot</div>
          <div className="text-xl font-semibold">{player.foot ?? "-"}</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Height</div>
          <div className="text-xl font-semibold">
            {player.height ? `${player.height} cm` : "-"}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Market Value</div>

          <div className="text-xl font-semibold">
            {latestMarketValue
              ? `€${latestMarketValue.value.toLocaleString()}`
              : "-"}
          </div>
        </div>
      </section>

      {/* Transfer history */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Transfer History</h2>

        {player.transfers.length === 0 ? (
          <p className="text-gray-500">No transfer history available.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-left">Market Value</th>
              </tr>
            </thead>

            <tbody>
              {player.transfers.map((transfer) => (
                <tr key={transfer.id} className="border-b">
                  <td className="p-3">
                    {transfer.transferDate
                      ? transfer.transferDate.toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3">{transfer.fromClub?.name ?? "-"}</td>

                  <td className="p-3">{transfer.toClub?.name ?? "-"}</td>

                  <td className="p-3">
                    {transfer.fee
                      ? `€${transfer.fee.toLocaleString()}`
                      : "Free"}
                  </td>

                  <td className="p-3">
                    {transfer.marketValue
                      ? `€${transfer.marketValue.toLocaleString()}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Market value */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Market Value History</h2>

        {player.marketValues.length === 0 ? (
          <p className="text-gray-500">No market values recorded.</p>
        ) : (
          <table className="w-full border">
            <tbody>
              {player.marketValues.map((value) => (
                <tr key={value.id} className="border-b">
                  <td className="p-3">
                    {value.capturedAt.toLocaleDateString()}
                  </td>

                  <td className="p-3">€{value.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Injuries */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Injury History</h2>

        {player.injuries.length === 0 ? (
          <p className="text-gray-500">No injury records.</p>
        ) : (
          <table className="w-full border">
            <tbody>
              {player.injuries.map((injury) => (
                <tr key={injury.id} className="border-b">
                  <td className="p-3">{injury.description ?? "-"}</td>

                  <td className="p-3">
                    {injury.startDate
                      ? injury.startDate.toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3">
                    {injury.expectedReturn
                      ? injury.expectedReturn.toLocaleDateString()
                      : "-"}
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
