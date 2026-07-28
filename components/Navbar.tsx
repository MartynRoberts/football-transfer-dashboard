import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="font-black text-xl text-slate-900 tracking-tight whitespace-nowrap"
        >
          ⚽ TransferDash
        </Link>

        <form action="/search" className="flex-1 max-w-md">
          <input
            type="search"
            name="q"
            placeholder="Search players, clubs, leagues..."
            className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/leagues">Leagues</Link>
          <Link href="/clubs">Clubs</Link>
          <Link href="/players">Players</Link>
        </nav>
      </div>
    </header>
  );
}
