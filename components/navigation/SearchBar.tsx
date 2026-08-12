"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import SearchResultCard, {
  type SearchResultCardData,
} from "@/components/search/SearchResultCard";

interface SearchBarProps {
  mobile?: boolean;
}

interface SearchResult extends SearchResultCardData {
  id: string;
  name: string;
  slug: string;
  detail?: string | null;
  type: "player" | "club" | "league";
}

interface SearchResponse {
  players: Array<Omit<SearchResult, "type" | "detail"> & { position?: string | null }>;
  clubs: Array<Omit<SearchResult, "type" | "detail">>;
  leagues: Array<Omit<SearchResult, "type" | "detail"> & { country?: string | null }>;
}

export default function SearchBar({ mobile = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const placeholder = mobile ? "Search" : "Search players, clubs and leagues";

  const options = useMemo<SearchResult[]>(() => {
    if (!results) return [];
    return [
      ...results.players.map((result) => ({ ...result, detail: result.position, type: "player" as const })),
      ...results.clubs.map((result) => ({ ...result, type: "club" as const })),
      ...results.leagues.map((result) => ({ ...result, detail: result.country, type: "league" as const })),
    ];
  }, [results]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setOpen(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        setResults((await response.json()) as SearchResponse);
        setActiveIndex(-1);
      } catch {
        if (!controller.signal.aborted) setResults({ players: [], clubs: [], leagues: [] });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const resultHref = (result: SearchResult) =>
    `/${result.type === "player" ? "players" : result.type === "club" ? "clubs" : "leagues"}/${result.slug}`;

  return (
    <div ref={containerRef} className={`relative ${mobile ? "w-full" : "hidden min-w-[300px] lg:block"}`}>
      <form action="/search" role="search">
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (nextQuery.trim().length < 2) {
              setResults(null);
              setLoading(false);
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
            } else if (event.key === "ArrowDown" && options.length > 0) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) => (index + 1) % options.length);
            } else if (event.key === "ArrowUp" && options.length > 0) {
              event.preventDefault();
              setActiveIndex((index) => (index <= 0 ? options.length - 1 : index - 1));
            } else if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              window.location.assign(resultHref(options[activeIndex]));
            }
          }}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
          autoComplete="off"
          className="w-full rounded-lg border border-white bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-300 outline-none focus:border-brand"
        />
      </form>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-full min-w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white py-2 text-slate-900 shadow-xl">
          <div id={listboxId} role="listbox" aria-label="Search suggestions">
            {loading ? (
              <p className="px-3 py-2 text-sm text-slate-500">Searching…</p>
            ) : options.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">No results found</p>
            ) : (
              options.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  id={`${listboxId}-${index}`}
                  href={resultHref(result)}
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 no-underline ${activeIndex === index ? "bg-sky-50" : "hover:bg-slate-50"}`}
                >
                  <SearchResultCard result={result} compact />
                </Link>
              ))
            )}
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            className="mt-1 block border-t px-3 pt-2 text-sm font-medium text-brand"
            onClick={() => setOpen(false)}
          >
            View all results
          </Link>
        </div>
      )}
    </div>
  );
}
