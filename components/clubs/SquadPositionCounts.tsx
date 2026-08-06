import type { Prisma } from "@prisma/client";

type SquadPlayer = Prisma.PlayerGetPayload<{
  select: {
    id: true;
    position: true;
    secondaryPositions: true;
  };
}>;

interface PositionCount {
  position: string;
  primary: number;
  secondary: number;
  total: number;
}

function getSecondaryPositions(value: Prisma.JsonValue): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (position): position is string =>
        typeof position === "string" && position.trim().length > 0,
    );
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }

  return [];
}

const POSITION_ORDER = [
  // Attacking: left, centre, right
  "Left Winger",
  "Centre-Forward",
  "Striker",
  "Second Striker",
  "Right Winger",

  // Midfield: left, centre, right
  "Left Midfield",
  "Central Midfield",
  "Attacking Midfield",
  "Defensive Midfield",
  "Midfielder",
  "Right Midfield",

  // Defensive: left, centre, right
  "Left-Back",
  "Centre-Back",
  "Sweeper",
  "Defender",
  "Right-Back",

  // Goalkeeper
  "Goalkeeper",
] as const;

const POSITION_ORDER_INDEX = new Map(
  POSITION_ORDER.map((position, index) => [position.toLowerCase(), index]),
);

function buildPositionCounts(players: SquadPlayer[]): PositionCount[] {
  const counts = new Map<
    string,
    {
      primary: number;
      secondary: number;
    }
  >();

  for (const player of players) {
    const primaryPosition = player.position?.trim() || null;

    if (primaryPosition) {
      const current = counts.get(primaryPosition) ?? {
        primary: 0,
        secondary: 0,
      };

      current.primary += 1;
      counts.set(primaryPosition, current);
    }

    const secondaryPositions = new Set(
      getSecondaryPositions(player.secondaryPositions),
    );

    for (const secondaryPosition of secondaryPositions) {
      /*
       * Do not count the same player twice when their primary position
       * also appears in secondaryPositions.
       */
      if (secondaryPosition === primaryPosition) {
        continue;
      }

      const current = counts.get(secondaryPosition) ?? {
        primary: 0,
        secondary: 0,
      };

      current.secondary += 1;
      counts.set(secondaryPosition, current);
    }
  }

  return Array.from(counts, ([position, count]) => ({
    position,
    primary: count.primary,
    secondary: count.secondary,
    total: count.primary + count.secondary,
  })).sort((first, second) => {
    const firstIndex =
      POSITION_ORDER_INDEX.get(first.position.toLowerCase()) ??
      Number.MAX_SAFE_INTEGER;

    const secondIndex =
      POSITION_ORDER_INDEX.get(second.position.toLowerCase()) ??
      Number.MAX_SAFE_INTEGER;

    return (
      firstIndex - secondIndex || first.position.localeCompare(second.position)
    );
  });
}

export default function SquadPositionCounts({
  players,
}: {
  players: SquadPlayer[];
}) {
  const positionCounts = buildPositionCounts(players);

  if (positionCounts.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="section-title mb-0">Squad position counts</h2>

        <p className="mt-1 text-sm text-slate-500">
          A count of the primary positions players prefer along with secondary
          options where players might be less familiar in the role.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {positionCounts.map((count) => (
          <div key={count.position} className="analytics-panel">
            <div className="text-sm font-medium text-slate-600">
              {count.position}
            </div>

            <div className="mt-1 text-3xl font-bold">{count.primary}</div>

            <div className="mt-2 flex gap-3 text-xs text-slate-500">
              <span>+{count.secondary} secondary</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
