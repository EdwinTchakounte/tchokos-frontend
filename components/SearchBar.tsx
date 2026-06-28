"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getProducts } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = {
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
};

export function SearchBar({ className = "", autoFocus, onNavigate }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Suggestions instantanées (debounce 250ms)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const found = await getProducts({ search: q });
        setResults(found.slice(0, 6));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Fermeture au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(path: string) {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(path);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) go(`/boutique?recherche=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            autoFocus={autoFocus}
            placeholder="Rechercher une chaussure, un vêtement…"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-24 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
            aria-label="Rechercher"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Chercher
          </button>
        </div>
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
          {loading && results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Recherche…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              Aucun résultat pour « {query.trim()} »
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => go(`/produit/${p.slug}`)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50"
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {p.image && (
                        <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                      <span className="block text-xs text-slate-400">{p.category_name}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-ink">
                      {formatPrice(p.price)}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => go(`/boutique?recherche=${encodeURIComponent(query.trim())}`)}
                  className="w-full bg-brand-50 px-4 py-2.5 text-center text-sm font-semibold text-brand-700 hover:bg-brand-100"
                >
                  Voir tous les résultats →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" strokeLinecap="round" />
    </svg>
  );
}
