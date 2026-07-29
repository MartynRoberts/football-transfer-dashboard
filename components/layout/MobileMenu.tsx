"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden relative">
      {/* Menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          rounded-lg
          border
          border-slate-700
          p-2
          text-slate-300
          hover:text-white
          hover:bg-slate-800
          transition
        "
        aria-label="Toggle menu"
      >
        {open ? (
          <span className="text-xl">✕</span>
        ) : (
          <span className="text-xl">☰</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            right-0
            top-12
            w-56
            rounded-xl
            border
            border-slate-800
            bg-slate-950
            shadow-xl
            p-4
          "
        >
          <nav className="flex flex-col gap-3 text-sm">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/leagues"
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              Leagues
            </Link>

            <Link
              href="/clubs"
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              Clubs
            </Link>

            <Link
              href="/players"
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              Players
            </Link>

            <Link
              href="/transfers"
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              Transfers
            </Link>

            {/* Mobile search */}
            <SearchBar mobile={true} />
          </nav>
        </div>
      )}
    </div>
  );
}
