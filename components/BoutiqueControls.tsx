"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category, Product } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";

const TARGETS = [
  { value: "", label: "Tous" },
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "enfant", label: "Enfant" },
  { value: "unisexe", label: "Unisexe" },
];

const SORTS = [
  { value: "", label: "Populaires" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "nom", label: "Nom A-Z" },
];

type Props = { products: Product[]; categories: Category[] };

export function BoutiqueControls({ products, categories }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);

  const current = {
    categorie: params.get("categorie") ?? "",
    cible: params.get("cible") ?? "",
    prix_min: params.get("prix_min") ?? "",
    prix_max: params.get("prix_max") ?? "",
    promo: params.get("promo") === "1",
    stock: params.get("stock") === "1",
    tri: params.get("tri") ?? "",
  };

  const [minPrice, setMinPrice] = useState(current.prix_min);
  const [maxPrice, setMaxPrice] = useState(current.prix_max);

  function push(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.push(qs ? `/boutique?${qs}` : "/boutique");
  }

  const activeCount =
    (current.categorie ? 1 : 0) +
    (current.cible ? 1 : 0) +
    (current.promo ? 1 : 0) +
    (current.stock ? 1 : 0) +
    (current.prix_min || current.prix_max ? 1 : 0);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium lg:hidden"
        >
          <FilterIcon /> Filtres
          {activeCount > 0 && (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
        <p className="hidden text-sm text-slate-500 lg:block">
          {products.length} article{products.length > 1 ? "s" : ""}
        </p>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-slate-500">Trier&nbsp;:</span>
          <select
            value={current.tri}
            onChange={(e) => push({ tri: e.target.value || null })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar filtres */}
        <aside
          className={`${panelOpen ? "block" : "hidden"} lg:block space-y-6 rounded-2xl border border-slate-100 p-5 shadow-card h-fit lg:sticky lg:top-28`}
        >
          <FilterGroup title="Catégorie">
            <PillRow>
              <Pill active={!current.categorie} onClick={() => push({ categorie: null })}>
                Toutes
              </Pill>
              {categories.map((c) => (
                <Pill
                  key={c.slug}
                  active={current.categorie === c.slug}
                  onClick={() => push({ categorie: c.slug })}
                >
                  {c.name}
                </Pill>
              ))}
            </PillRow>
          </FilterGroup>

          <FilterGroup title="Pour qui">
            <PillRow>
              {TARGETS.map((t) => (
                <Pill
                  key={t.value}
                  active={current.cible === t.value}
                  onClick={() => push({ cible: t.value || null })}
                >
                  {t.label}
                </Pill>
              ))}
            </PillRow>
          </FilterGroup>

          <FilterGroup title="Prix (FCFA)">
            <div className="flex items-center gap-2">
              <input
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="Min"
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
              />
              <span className="text-slate-300">—</span>
              <input
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="Max"
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => push({ prix_min: minPrice || null, prix_max: maxPrice || null })}
              className="mt-2 w-full rounded-lg bg-slate-100 py-1.5 text-sm font-medium hover:bg-slate-200"
            >
              Appliquer
            </button>
          </FilterGroup>

          <FilterGroup title="Options">
            <Toggle checked={current.promo} onChange={(v) => push({ promo: v ? "1" : null })}>
              En promotion
            </Toggle>
            <Toggle checked={current.stock} onChange={(v) => push({ stock: v ? "1" : null })}>
              En stock uniquement
            </Toggle>
          </FilterGroup>

          {activeCount > 0 && (
            <button
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                const next = new URLSearchParams();
                const r = params.get("recherche");
                if (r) next.set("recherche", r);
                router.push(next.toString() ? `/boutique?${next}` : "/boutique");
              }}
              className="w-full rounded-full border border-slate-200 py-2 text-sm font-medium text-ink-soft hover:bg-slate-50"
            >
              Réinitialiser les filtres
            </button>
          )}
        </aside>

        {/* Résultats */}
        <div>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function PillRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-soft hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-ink-soft">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      {children}
    </label>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 5h18M6 12h12M10 19h4" strokeLinecap="round" />
    </svg>
  );
}
