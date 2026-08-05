import Link from "next/link";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import SeasonSwitcher from "@/components/navigation/SeasonSwitcher";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="
            flex
            items-center
            gap-2
            text-xl
            font-black
            tracking-tight
            hover:text-blue-400
            transition-colors
          "
        >
          <span className="text-2xl">⚽</span>
          TransferDashboard
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="white hover:text-white">
            Home
          </Link>

          <Link href="/leagues" className="white hover:text-white">
            Leagues
          </Link>

          <Link href="/clubs" className="white hover:text-white">
            Clubs
          </Link>

          <Link href="/players" className="white hover:text-white">
            Players
          </Link>
        </nav>

        {/* Desktop search */}
        <SearchBar />

        {/*  
        <div className="flex items-center gap-3">
          <SeasonSwitcher />
        </div>
        */}

        {/* Mobile menu */}
        <MobileMenu />
      </div>
    </header>
  );
}
