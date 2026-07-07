"use client";

import { useMemo, useState } from "react";
import type { DeliveryZone } from "@/lib/types";
import { formatPrice } from "@/lib/format";

type Status = "loading" | "ready" | "error";

// Sélecteur de quartier de livraison (Douala) — version « soft » :
// recherche + liste de pastilles sélectionnables, avec états explicites
// (chargement / erreur+réessayer / vide) pour ne jamais rester vide en
// silence quand l'API des zones ne répond pas.
export function DeliveryZonePicker({
  zones,
  value,
  onChange,
  status,
  onRetry,
}: {
  zones: DeliveryZone[];
  value: number | null;
  onChange: (id: number | null) => void;
  status: Status;
  onRetry: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => z.name.toLowerCase().includes(q));
  }, [zones, query]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-ink">
          Quartier de livraison
          <span className="ml-1 font-normal text-slate-400">· Douala</span>
        </label>
        {status === "ready" && zones.length > 0 && (
          <span className="text-[11px] text-slate-400">
            {zones.length} quartiers
          </span>
        )}
      </div>

      {/* Chargement */}
      {status === "loading" && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
          Chargement des quartiers…
        </div>
      )}

      {/* Erreur */}
      {status === "error" && (
        <div className="mt-3 rounded-lg bg-amber-50 p-3">
          <p className="text-xs text-amber-700">
            Impossible de charger les quartiers (connexion). Vérifiez votre
            réseau.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Vide */}
      {status === "ready" && zones.length === 0 && (
        <p className="mt-3 text-sm text-slate-400">
          Aucun quartier disponible pour le moment. Contactez-nous sur WhatsApp
          pour la livraison.
        </p>
      )}

      {/* Liste */}
      {status === "ready" && zones.length > 0 && (
        <>
          {zones.length > 6 && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un quartier…"
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          )}

          <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <p className="py-3 text-center text-xs text-slate-400">
                Aucun quartier « {query} ».
              </p>
            )}
            {filtered.map((z) => {
              const selected = z.id === value;
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => onChange(selected ? null : z.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                      : "border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                        selected
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate text-sm font-medium text-ink">
                      {z.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-ink">
                      {formatPrice(z.fee)}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      ~{z.eta_minutes} min
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
