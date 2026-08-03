interface MarketValuePercentileProps {
  label: string;
  value: number;
  description?: string;
}

export default function MarketValuePercentile({
  label,
  value,
  description,
}: MarketValuePercentileProps) {
  const percentage = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <div className="font-medium">{label}</div>

          {description && (
            <div className="text-sm text-slate-500">{description}</div>
          )}
        </div>

        <span className="text-sm font-semibold tabular-nums">
          {percentage}%
        </span>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={`${label} market value percentile`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-[width]"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}
