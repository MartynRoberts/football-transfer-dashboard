import { assessTransferValue } from "@/lib/transfers/value-rating";

interface TransferValueRatingProps {
  fee: number | null;
  marketValue: number | null;
}

const ratingClasses = {
  "Exceptional value": "bg-emerald-100 text-emerald-800",
  "Excellent value": "bg-green-100 text-green-800",
  "Good value": "bg-lime-100 text-lime-800",
  "Fair value": "bg-slate-100 text-slate-700",
  Expensive: "bg-amber-100 text-amber-800",
  "Very expensive": "bg-red-100 text-red-800",
  Unrated: "bg-slate-100 text-slate-500",
} as const;

export default function TransferValueRating({
  fee,
  marketValue,
}: TransferValueRatingProps) {
  const assessment = assessTransferValue(fee, marketValue);

  const detail =
    assessment.percentageDifference === null
      ? null
      : assessment.percentageDifference === -100
        ? "Free transfer"
        : assessment.percentageDifference <= 0
          ? `${Math.abs(assessment.percentageDifference)}% below market value`
          : `${assessment.percentageDifference}% above market value`;

  return (
    <div>
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
          ratingClasses[assessment.rating]
        }`}
      >
        {assessment.rating}
      </span>

      {detail && <div className="mt-1 text-xs text-slate-500">{detail}</div>}
    </div>
  );
}
