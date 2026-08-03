interface InjuryForMetrics {
  description: string;
  startDate: Date;
  expectedReturn: Date | null;
  days: number | null;
  gamesMissed: number | null;
  season: string | null;
}

export interface RecurrentInjuryResult {
  warning: boolean;
  group: string | null;
  count: number;
}

export function calculateInjuryGamesPercentage(
  gamesMissed: number,
  appearances: number,
): number | null {
  const knownGames = gamesMissed + appearances;

  if (knownGames <= 0) {
    return null;
  }

  return Number(((gamesMissed / knownGames) * 100).toFixed(1));
}

function getInjuryGroup(description: string): string | null {
  const value = description.trim().toLowerCase();

  if (!value) {
    return null;
  }

  if (value.includes("hamstring") || value.includes("hamstring strain")) {
    return "Hamstring";
  }

  if (value.includes("groin") || value.includes("adductor")) {
    return "Groin/adductor";
  }

  if (
    value.includes("knee") ||
    value.includes("meniscus") ||
    value.includes("cruciate") ||
    value.includes("acl")
  ) {
    return "Knee";
  }

  if (value.includes("ankle") || value.includes("achilles")) {
    return "Ankle/Achilles";
  }

  if (value.includes("calf") || value.includes("lower leg")) {
    return "Calf/lower leg";
  }

  if (value.includes("thigh") || value.includes("muscle")) {
    return "Thigh/muscle";
  }

  if (value.includes("back") || value.includes("spine")) {
    return "Back";
  }

  if (value.includes("shoulder") || value.includes("arm")) {
    return "Shoulder/arm";
  }

  if (value.includes("foot") || value.includes("toe")) {
    return "Foot";
  }

  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function findRecurrentInjury(
  injuries: InjuryForMetrics[],
): RecurrentInjuryResult {
  const groups = injuries.reduce<Record<string, number>>((counts, injury) => {
    const group = getInjuryGroup(injury.description);

    if (!group) {
      return counts;
    }

    counts[group] = (counts[group] ?? 0) + 1;

    return counts;
  }, {});

  const recurrent = Object.entries(groups)
    .filter(([, count]) => count >= 2)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0];

  if (!recurrent) {
    return {
      warning: false,
      group: null,
      count: 0,
    };
  }

  const [group, count] = recurrent;

  return {
    warning: true,
    group,
    count,
  };
}
