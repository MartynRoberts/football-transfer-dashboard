import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";

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
            h-full
          "
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={80}
            height={80}
            className="rounded-lg object-cover h-full"
          />
          <span className="font-[family-name:var(--font-ibm-plex-mono)] font-bold">
            TransferDashboard
          </span>
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
