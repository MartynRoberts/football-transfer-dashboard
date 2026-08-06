interface PlayerPositionsPitchProps {
  primaryPosition: string | null;
  secondaryPositions: string[];
}

interface PitchNode {
  key: string;
  labels: string[];
  displayLabel: string;
  x: number;
  y: number;
}

const PITCH_NODES: PitchNode[] = [
  {
    key: "goalkeeper",
    labels: ["Goalkeeper"],
    displayLabel: "Goalkeeper",
    x: 8,
    y: 32,
  },

  {
    key: "sweeper",
    labels: ["Sweeper"],
    displayLabel: "Sweeper",
    x: 18,
    y: 32,
  },

  {
    key: "left-back",
    labels: ["Left-Back"],
    displayLabel: "Left-Back",
    x: 28,
    y: 11,
  },
  {
    key: "centre-back",
    labels: ["Centre-Back", "Defender"],
    displayLabel: "Centre-Back",
    x: 28,
    y: 32,
  },
  {
    key: "right-back",
    labels: ["Right-Back"],
    displayLabel: "Right-Back",
    x: 28,
    y: 53,
  },

  {
    key: "defensive-midfield",
    labels: ["Defensive Midfield"],
    displayLabel: "Defensive Midfield",
    x: 43,
    y: 32,
  },

  {
    key: "left-midfield",
    labels: ["Left Midfield"],
    displayLabel: "Left Midfield",
    x: 55,
    y: 11,
  },
  {
    key: "central-midfield",
    labels: ["Central Midfield", "Midfielder"],
    displayLabel: "Central Midfield",
    x: 55,
    y: 32,
  },
  {
    key: "right-midfield",
    labels: ["Right Midfield"],
    displayLabel: "Right Midfield",
    x: 55,
    y: 53,
  },

  {
    key: "attacking-midfield",
    labels: ["Attacking Midfield"],
    displayLabel: "Attacking Midfield",
    x: 70,
    y: 32,
  },

  {
    key: "left-winger",
    labels: ["Left Winger"],
    displayLabel: "Left Winger",
    x: 80,
    y: 11,
  },
  {
    key: "second-striker",
    labels: ["Second Striker"],
    displayLabel: "Second Striker",
    x: 82,
    y: 32,
  },
  {
    key: "right-winger",
    labels: ["Right Winger"],
    displayLabel: "Right Winger",
    x: 80,
    y: 53,
  },

  {
    key: "centre-forward",
    labels: ["Centre-Forward", "Striker"],
    displayLabel: "Centre-Forward",
    x: 91,
    y: 32,
  },
];

function normalizePosition(position: string): string {
  return position.trim().toLowerCase().replace(/\s+/g, " ");
}

function nodeMatchesPosition(node: PitchNode, normalizedPosition: string) {
  return node.labels.some(
    (label) => normalizePosition(label) === normalizedPosition,
  );
}

export default function PlayerPositionsPitch({
  primaryPosition,
  secondaryPositions,
}: PlayerPositionsPitchProps) {
  const normalizedPrimary = primaryPosition
    ? normalizePosition(primaryPosition)
    : null;

  const normalizedSecondary = secondaryPositions.map(normalizePosition);

  const ariaLabel = [
    primaryPosition ? `Primary position: ${primaryPosition}` : null,
    secondaryPositions.length > 0
      ? `Secondary positions: ${secondaryPositions.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <section className="flex">
      <div className="mb-4 flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap items-center text-sm flex-col items-start analytics-panel">
          <h2 className="text-sm text-gray-500">Positions</h2>

          <span className="flex items-center gap-2 mt-4 mb-2">
            <span className="size-3 rounded-full bg-lime-200 ring-2 ring-lime-100" />
            Primary
          </span>
          {primaryPosition && (
            <span className="text-sm font-bold">{primaryPosition}</span>
          )}

          <span className="flex items-center gap-2 mt-4 mb-2">
            <span className="size-3 rounded-full bg-lime-500" />
            Secondary
          </span>
          {secondaryPositions.length ? (
            secondaryPositions.map((position) => (
              <span key={position} className="text-sm font-bold">
                {position}
              </span>
            ))
          ) : (
            <span key="none" className="text-sm font-bold">
              None
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl ml-4">
        <svg
          viewBox="0 0 100 64"
          className="h-auto w-full rounded-lg"
          role="img"
          aria-label={ariaLabel || "Football pitch positions"}
        >
          {/* Pitch background */}
          <rect x="1" y="1" width="98" height="62" fill="#164e3f" />

          {/* Halfway line */}
          <line
            x1="50"
            y1="1"
            x2="50"
            y2="63"
            stroke="#94a3b8"
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />

          {/* Centre circle */}
          <circle
            cx="50"
            cy="32"
            r="7"
            fill="none"
            stroke="#94a3b8"
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          <circle cx="50" cy="32" r="0.7" fill="#94a3b8" fillOpacity="0.8" />

          {/* Left penalty area */}
          <rect
            x="1"
            y="17"
            width="16"
            height="30"
            fill="none"
            stroke="#94a3b8"
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          <rect
            x="1"
            y="24"
            width="7"
            height="16"
            fill="none"
            stroke="#94a3b8"
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          <circle cx="12" cy="32" r="0.7" fill="#94a3b8" fillOpacity="0.8" />

          {/* Right penalty area */}
          <rect
            x="83"
            y="17"
            width="16"
            height="30"
            fill="none"
            stroke="#94a3b8"
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          <rect
            x="92"
            y="24"
            width="7"
            height="16"
            fill="none"
            stroke="#94a3b8"
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          <circle cx="88" cy="32" r="0.7" fill="#94a3b8" fillOpacity="0.8" />

          {/* Position dots */}
          {PITCH_NODES.map((node) => {
            const isPrimary = normalizedPrimary
              ? nodeMatchesPosition(node, normalizedPrimary)
              : false;

            const isSecondary = normalizedSecondary.some((position) =>
              nodeMatchesPosition(node, position),
            );

            const isActive = isPrimary || isSecondary;
            const positionStatus = isPrimary
              ? "Primary position"
              : isSecondary
                ? "Secondary position"
                : "Not listed position";
            const tooltip = `${node.displayLabel} — ${positionStatus}`;

            return (
              <g key={node.key}>
                {isPrimary && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="5"
                    fill="#d9f99d"
                    fillOpacity="0.24"
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isPrimary ? 2.8 : 2.4}
                  fill={
                    isPrimary ? "#d9f99d" : isSecondary ? "#84cc16" : "#64748b"
                  }
                  stroke={
                    isPrimary ? "#f7fee7" : isSecondary ? "#bef264" : "#94a3b8"
                  }
                  strokeWidth={isActive ? 0.8 : 0.5}
                  opacity={isActive ? 1 : 0.5}
                >
                  <title>{tooltip}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
