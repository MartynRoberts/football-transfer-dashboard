interface ClubHeaderProps {
  name: string;
  league?: string;
  country?: string;
}

export function ClubHeader({ name, league, country }: ClubHeaderProps) {
  return (
    <div>
      <h1 className="text-4xl font-bold">{name}</h1>

      <p className="text-gray-500 mt-2">
        {league} • {country}
      </p>
    </div>
  );
}
