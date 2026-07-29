import Image from "next/image";
import Link from "next/link";
import { LEAGUE_META } from "@/lib/data/leagues";

interface Props {
  league: {
    name: string;
    transfermarktId?: string | null;
    slug: string;
    country?: string | null;
  };

  link?: boolean;
  h1?: boolean;
  country?: boolean;
}

export default function LeagueIdentity({
  league,
  link = false,
  h1 = false,
  country = false,
}: Props) {
  const meta = league.transfermarktId
    ? LEAGUE_META[league.transfermarktId as keyof typeof LEAGUE_META]
    : null;

  let width = 32;
  if (!link && h1 && country) {
    width = 48;
  }
  const content = (
    <div className="flex items-center gap-3">
      {meta?.logo && (
        <Image
          src={meta.logo}
          alt={league.name}
          width={width}
          height={width}
          className="object-contain"
        />
      )}

      {link ? (
        <span className="font-medium">{league.name}</span>
      ) : !link && h1 && country ? (
        <div className="ml-2">
          <h1 className="text-3xl font-bold">{league.name}</h1>
          <p className="text-gray-500">{league.country ?? "Unknown country"}</p>
        </div>
      ) : (
        <h3 className="font-medium">{league.name}</h3>
      )}
    </div>
  );

  if (link) {
    return (
      <Link
        href={`/leagues/${league.slug}`}
        className="hover:text-blue-600 transition"
      >
        {content}
      </Link>
    );
  }

  return content;
}
