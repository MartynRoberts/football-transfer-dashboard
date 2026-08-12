export function formatContractTimeRemaining(
  contractDate: Date,
  today = new Date(),
): string {
  if (contractDate.getTime() < today.getTime()) return "Contract expired";

  let months =
    (contractDate.getUTCFullYear() - today.getUTCFullYear()) * 12 +
    contractDate.getUTCMonth() -
    today.getUTCMonth();

  if (contractDate.getUTCDate() < today.getUTCDate()) months -= 1;

  if (months <= 0) return "Less than 1 month left";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const parts = [
    years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : null,
    remainingMonths > 0
      ? `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`
      : null,
  ].filter(Boolean);

  return `${parts.join(", ")} left`;
}
