import Image from "next/image";

interface PlayerCardImageProps {
  src: string | null;
  playerName: string;
  preload?: boolean;
  fillCard?: boolean;
  overlayCard?: boolean;
}

export default function PlayerCardImage({
  src,
  playerName,
  preload = false,
  fillCard = false,
  overlayCard = false,
}: PlayerCardImageProps) {
  const showPlayerImage = Boolean(src);

  if (fillCard) {
    return (
      <Image
        src={showPlayerImage ? src! : "/images/player-placeholder.png"}
        alt={showPlayerImage ? `${playerName} profile` : ""}
        width={96}
        height={112}
        sizes="96px"
        aria-hidden={showPlayerImage ? undefined : "true"}
        preload={preload}
        fetchPriority={preload ? "high" : "auto"}
        className={
          overlayCard
            ? "absolute inset-y-0 right-0 h-full w-24 object-cover object-top"
            : "ml-auto h-full w-24 shrink-0 self-stretch object-cover object-top"
        }
      />
    );
  }

  return (
    <div className="relative ml-auto h-14 w-12 shrink-0 overflow-hidden">
      <Image
        src="/images/player-placeholder.png"
        alt=""
        fill
        sizes="48px"
        aria-hidden="true"
        className="object-contain"
      />

      {showPlayerImage && (
        <Image
          src={src!}
          alt={`${playerName} profile`}
          fill
          sizes="48px"
          preload={preload}
          fetchPriority={preload ? "high" : "auto"}
          className="object-contain"
        />
      )}
    </div>
  );
}
