export type TransferValueRating =
  | "Exceptional value"
  | "Excellent value"
  | "Good value"
  | "Fair value"
  | "Expensive"
  | "Very expensive"
  | "Unrated";

export interface TransferValueAssessment {
  rating: TransferValueRating;
  ratio: number | null;
  percentageDifference: number | null;
}

export function assessTransferValue(
  fee: number | null,
  marketValue: number | null,
): TransferValueAssessment {
  if (fee === null || marketValue === null || marketValue <= 0) {
    return {
      rating: "Unrated",
      ratio: null,
      percentageDifference: null,
    };
  }

  if (fee === 0) {
    return {
      rating: "Exceptional value",
      ratio: 0,
      percentageDifference: -100,
    };
  }

  const ratio = fee / marketValue;

  const percentageDifference = Math.round(
    ((fee - marketValue) / marketValue) * 100,
  );

  let rating: TransferValueRating;

  if (ratio <= 0.5) {
    rating = "Exceptional value";
  } else if (ratio <= 0.75) {
    rating = "Excellent value";
  } else if (ratio <= 1) {
    rating = "Good value";
  } else if (ratio <= 1.25) {
    rating = "Fair value";
  } else if (ratio <= 1.5) {
    rating = "Expensive";
  } else {
    rating = "Very expensive";
  }

  return {
    rating,
    ratio,
    percentageDifference,
  };
}
