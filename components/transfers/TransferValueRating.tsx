interface TransferValueRatingProps {
  fee: number | null;
  marketValue: number | null;
  perspective?: "buyer" | "seller";
}

type Rating =
  | "Exceptional value"
  | "Excellent value"
  | "Good value"
  | "Fair value"
  | "Poor value"
  | "Very poor value"
  | "Unrated";

interface Assessment {
  rating: Rating;
  detail: string | null;
}

const ratingClasses: Record<Rating, string> = {
  "Exceptional value": "bg-emerald-100 text-emerald-800",
  "Excellent value": "bg-green-100 text-green-800",
  "Good value": "bg-lime-100 text-lime-800",
  "Fair value": "bg-slate-100 text-slate-700",
  "Poor value": "bg-amber-100 text-amber-800",
  "Very poor value": "bg-red-100 text-red-800",
  Unrated: "bg-slate-100 text-slate-500",
};

function assessBuyerValue(fee: number, marketValue: number): Assessment {
  const ratio = fee / marketValue;
  const percentageDifference = Math.round(
    ((fee - marketValue) / marketValue) * 100,
  );

  if (fee === 0) {
    return {
      rating: "Exceptional value",
      detail: "Free transfer",
    };
  }

  if (ratio <= 0.5) {
    return {
      rating: "Exceptional value",
      detail: `${Math.abs(percentageDifference)}% below valuation`,
    };
  }

  if (ratio <= 0.75) {
    return {
      rating: "Excellent value",
      detail: `${Math.abs(percentageDifference)}% below valuation`,
    };
  }

  if (ratio <= 1) {
    return {
      rating: "Good value",
      detail:
        percentageDifference === 0
          ? "Matched valuation"
          : `${Math.abs(percentageDifference)}% below valuation`,
    };
  }

  if (ratio <= 1.25) {
    return {
      rating: "Fair value",
      detail: `${percentageDifference}% above valuation`,
    };
  }

  if (ratio <= 1.5) {
    return {
      rating: "Poor value",
      detail: `${percentageDifference}% above valuation`,
    };
  }

  return {
    rating: "Very poor value",
    detail: `${percentageDifference}% above valuation`,
  };
}

function assessSellerValue(fee: number, marketValue: number): Assessment {
  const ratio = fee / marketValue;
  const percentageDifference = Math.round(
    ((fee - marketValue) / marketValue) * 100,
  );

  if (fee === 0) {
    return {
      rating: "Very poor value",
      detail: "Player left for free",
    };
  }

  if (ratio >= 1.5) {
    return {
      rating: "Exceptional value",
      detail: `${percentageDifference}% above valuation`,
    };
  }

  if (ratio >= 1.25) {
    return {
      rating: "Excellent value",
      detail: `${percentageDifference}% above valuation`,
    };
  }

  if (ratio >= 1) {
    return {
      rating: "Good value",
      detail:
        percentageDifference === 0
          ? "Matched valuation"
          : `${percentageDifference}% above valuation`,
    };
  }

  if (ratio >= 0.75) {
    return {
      rating: "Fair value",
      detail: `${Math.abs(percentageDifference)}% below valuation`,
    };
  }

  if (ratio >= 0.5) {
    return {
      rating: "Poor value",
      detail: `${Math.abs(percentageDifference)}% below valuation`,
    };
  }

  return {
    rating: "Very poor value",
    detail: `${Math.abs(percentageDifference)}% below valuation`,
  };
}

function assessTransferValue(
  fee: number | null,
  marketValue: number | null,
  perspective: "buyer" | "seller",
): Assessment {
  if (fee === null || marketValue === null || marketValue <= 0) {
    return {
      rating: "Unrated",
      detail: null,
    };
  }

  return perspective === "seller"
    ? assessSellerValue(fee, marketValue)
    : assessBuyerValue(fee, marketValue);
}

export default function TransferValueRating({
  fee,
  marketValue,
  perspective = "buyer",
}: TransferValueRatingProps) {
  const assessment = assessTransferValue(fee, marketValue, perspective);

  return (
    <div>
      <span
        className={[
          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
          ratingClasses[assessment.rating],
        ].join(" ")}
      >
        {assessment.rating}
      </span>

      {assessment.detail && (
        <div className="mt-1 text-xs text-slate-500">{assessment.detail}</div>
      )}
    </div>
  );
}
