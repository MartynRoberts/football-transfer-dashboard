import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full shrink-0 self-stretch border-b border-slate-800 bg-slate-950 text-white shadow-lg">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
        {/* Logo */}
        <Link
          href="/"
          className="
            flex
            items-center
            gap-0
            text-base
            font-black
            tracking-tight
            h-full
            sm:gap-0
            sm:text-xl
          "
        >
          <Image
            src="/images/logo3.png"
            alt=""
            width={24}
            height={24}
            sizes="(min-width: 640px) 24px, 20px"
            className="size-5 shrink-0 object-contain sm:size-6"
          />
          <span className="font-[family-name:var(--font-ibm-plex-mono)] font-bold">
            TransferDashboard
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="white hover:text-white hover:underline">
            Home
          </Link>

          <Link
            href="/leagues"
            className="white hover:text-white hover:underline"
          >
            Leagues
          </Link>

          <Link
            href="/clubs"
            className="white hover:text-white hover:underline"
          >
            Clubs
          </Link>

          <Link
            href="/players"
            className="white hover:text-white hover:underline"
          >
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
