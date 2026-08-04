"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search as SearchIcon, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUIStore, useSearchStore } from "@/store/ui-store";
import { useAutocomplete, useTrendingSearches } from "@/hooks/use-catalog";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { formatPrice } from "@/lib/utils";
import { productImageUrl } from "@/constants/imagery";

export function SearchModal() {
  const open = useUIStore((s) => s.searchOpen);
  const close = useUIStore((s) => s.closeSearch);
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const recent = useSearchStore((s) => s.recent);
  const addRecent = useSearchStore((s) => s.addRecent);
  const clearRecent = useSearchStore((s) => s.clearRecent);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebouncedValue(query, 250);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open, setQuery]);

  const { data: trending } = useTrendingSearches();
  const { data: autocomplete } = useAutocomplete(debounced);

  const suggestions = useMemo(() => {
    if (debounced.trim().length < 2) return [];
    return autocomplete?.suggestions ?? [];
  }, [debounced, autocomplete]);

  const submitSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    addRecent(trimmed);
    close();
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : close())}>
      <DialogContent className="top-0 max-w-3xl translate-y-0 p-0">
        <DialogHeader className="mt-6 px-8">
          <DialogTitle className="sr-only">Search</DialogTitle>
        </DialogHeader>
        <div className="px-8">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <SearchIcon className="size-5 shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch(query)}
              placeholder="Search products, collections…"
              className="h-12 flex-1 bg-transparent text-lg text-ink placeholder:text-economy focus-visible:outline-none"
              aria-label="Search"
            />
            <button
              onClick={() => submitSearch(query)}
              className="shrink-0 text-xs uppercase tracking-[0.18em] text-ink hover:opacity-60"
            >
              Enter
            </button>
          </div>
        </div>

        <div className="min-h-[40vh] overflow-y-auto px-8 pb-8">
          {debounced.trim().length < 2 ? (
            <>
              {recent.length > 0 ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow">Recent</p>
                    <button onClick={clearRecent} className="text-[11px] text-muted hover:text-ink underline-offset-2 hover:underline">
                      Clear
                    </button>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {recent.map((term) => (
                      <li key={term}>
                        <button
                          onClick={() => submitSearch(term)}
                          className="flex items-center gap-3 text-sm text-ink hover:opacity-70"
                        >
                          <Clock className="size-3.5 text-muted" /> {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {trending && trending.length > 0 ? (
                <div className="mt-8">
                  <p className="eyebrow">Trending</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {trending.map((term) => (
                      <button
                        key={term}
                        onClick={() => submitSearch(term)}
                        className="border border-ink/15 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-background"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-6">
              {suggestions.length > 0 ? (
                <ul className="space-y-1">
                  {suggestions.slice(0, 8).map((s) => (
                    <li key={s}>
                      <button
                        onClick={() => submitSearch(s)}
                        className="flex w-full items-center gap-3 px-2 py-2.5 text-left text-sm text-ink hover:bg-line/40"
                      >
                        <SearchIcon className="size-3.5 text-muted" /> {s}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {autocomplete?.products && autocomplete.products.length > 0 ? (
                <div className="mt-6">
                  <p className="eyebrow">Products</p>
                  <ul className="mt-3 space-y-3">
                    {autocomplete.products.slice(0, 6).map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/products/${p.slug}`}
                          onClick={close}
                          className="flex items-center gap-4 hover:opacity-80"
                        >
                          <div className="relative size-14 shrink-0 overflow-hidden bg-mist">
                            <Image src={productImageUrl(p.images?.[0]?.url)} alt={p.name} fill className="object-cover" sizes="56px" />
                          </div>
                          <div className="flex flex-1 items-center justify-between">
                            <div>
                              {p.brand ? <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{p.brand}</p> : null}
                              <p className="text-sm text-ink">{p.name}</p>
                            </div>
                            <p className="text-sm text-ink">{formatPrice(p.basePrice, p.currency)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {suggestions.length === 0 && (!autocomplete?.products || autocomplete.products.length === 0) ? (
                <p className="py-8 text-center text-sm text-muted">No results for “{debounced}”</p>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}