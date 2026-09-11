import Image from "next/image";
import { getClubLogoUrl } from "@/lib/images/club-logo-url";

export default function ClubLogo({
  url,
  name,
  size,
  preload = false,
}: {
  url?: string | null;
  name: string;
  size: number;
  preload?: boolean;
}) {
  if (!url) return null;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Image
        src={getClubLogoUrl(url)}
        alt={`${name} badge`}
        width={size}
        height={size}
        sizes={`${size}px`}
        preload={preload}
        fetchPriority={preload ? "high" : "auto"}
        className="size-full object-contain"
      />
    </span>
  );
}
