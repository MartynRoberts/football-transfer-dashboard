interface SquadPyramidPlayer {
  id: string;
  dateOfBirth: Date | string | null;
  contract: Date | null;
}

interface PyramidRow {
  label: string;
  count: number;
}

function calculateAge(dateOfBirth: Date, referenceDate: Date): number {
  let age = referenceDate.getFullYear() - dateOfBirth.getFullYear();

  const birthdayHasPassed =
    referenceDate.getMonth() > dateOfBirth.getMonth() ||
    (referenceDate.getMonth() === dateOfBirth.getMonth() &&
      referenceDate.getDate() >= dateOfBirth.getDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}

function parseDateValue(value: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function buildAgeRows(
  players: SquadPyramidPlayer[],
  referenceDate: Date,
): PyramidRow[] {
  const counts = {
    "Under 18": 0,
    "18–21": 0,
    "22–25": 0,
    "26–29": 0,
    "30+": 0,
  };

  for (const player of players) {
    const dateOfBirth = parseDateValue(player.dateOfBirth);

    if (!dateOfBirth) {
      continue;
    }

    const age = calculateAge(dateOfBirth, referenceDate);

    if (age < 18) {
      counts["Under 18"] += 1;
    } else if (age <= 21) {
      counts["18–21"] += 1;
    } else if (age >= 22 && age <= 25) {
      counts["22–25"] += 1;
    } else if (age >= 26 && age <= 29) {
      counts["26–29"] += 1;
    } else if (age >= 30) {
      counts["30+"] += 1;
    }
  }

  return Object.entries(counts).map(([label, count]) => ({
    label,
    count,
  }));
}

function buildContractRows(
  players: SquadPyramidPlayer[],
  referenceDate: Date,
): PyramidRow[] {
  const currentYear = referenceDate.getFullYear();
  const counts = new Map<number, number>();

  for (const player of players) {
    const contract = parseDateValue(player.contract);

    if (!contract) {
      continue;
    }

    const expiryYear = contract.getFullYear();

    if (expiryYear < currentYear) {
      continue;
    }

    counts.set(expiryYear, (counts.get(expiryYear) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([firstYear], [secondYear]) => {
      return firstYear - secondYear;
    })
    .map(([year, count]) => ({
      label: year.toString(),
      count,
    }));
}

function PyramidChart({
  title,
  description,
  rows,
  emptyMessage,
}: {
  title: string;
  description: string;
  rows: PyramidRow[];
  emptyMessage: string;
}) {
  const maximumCount = Math.max(...rows.map((row) => row.count), 1);

  return (
    <section className="analytics-panel">
      <div className="mb-5">
        <h2 className="section-title mb-0">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const width =
              row.count === 0
                ? 0
                : Math.max((row.count / maximumCount) * 100, 8);

            return (
              <div
                key={row.label}
                className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3"
              >
                <span className="text-sm font-medium text-slate-700">
                  {row.label}
                </span>

                <div className="h-7 overflow-hidden rounded bg-slate-100">
                  <div
                    className="bg-brand flex h-full items-center justify-end rounded px-2 text-xs font-semibold text-white transition-[width]"
                    style={{
                      width: `${width}%`,
                    }}
                  >
                    {row.count > 0 ? row.count : null}
                  </div>
                </div>

                <span className="text-right text-sm font-semibold">
                  {row.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function SquadPyramids({
  players,
}: {
  players: SquadPyramidPlayer[];
}) {
  const referenceDate = new Date();

  const ageRows = buildAgeRows(players, referenceDate);

  const contractRows = buildContractRows(players, referenceDate);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PyramidChart
        title="Squad age pyramid"
        description="Current squad grouped by player age."
        rows={ageRows}
        emptyMessage="No player birth dates are available."
      />

      <PyramidChart
        title="Contracts expiring"
        description="Current squad grouped by contract expiry year."
        rows={contractRows}
        emptyMessage="No contract expiry dates are available."
      />
    </div>
  );
}
