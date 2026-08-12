import ClubLogo from "./ClubLogo";

export interface ClubNameData {
  name: string;
  logoUrl?: string | null;
}

export default function ClubName({
  club,
  size = 20,
  className = "",
}: {
  club: ClubNameData;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <ClubLogo url={club.logoUrl} name={club.name} size={size} />
      <span className="truncate">{club.name}</span>
    </span>
  );
}
