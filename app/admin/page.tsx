"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDashboard,
  updateProduct,
  type VendorDashboard,
  type VendorProduct,
} from "@/lib/vendor";
import { useAuth } from "@/lib/auth-context";
import { ProductDrawer } from "@/components/vendor/ProductDrawer";

type StatusFilter = "all" | "online" | "hidden" | "low" | "out";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { ready, isAdmin, user, logout } = useAuth();
  const [data, setData] = useState<VendorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<VendorProduct | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<number | "all">("all");
  const [statusF, setStatusF] = useState<StatusFilter>("all");

  const load = useCallback(async () => {
    try {
      setData(await getDashboard());
    } catch (err) {
      if (err instanceof Error && (err.message === "unauthorized" || err.message === "forbidden")) {
        router.replace("/connexion?next=/admin");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    if (!isAdmin) {
      router.replace("/connexion?next=/admin");
      return;
    }
    load();
  }, [ready, isAdmin, router, load]);

  async function handleLogout() {
    await logout();
    router.replace("/connexion");
  }

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }
  function openEdit(p: VendorProduct) {
    setEditing(p);
    setDrawerOpen(true);
  }

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.products.filter((p) => {
      if (q && !`${p.name} ${p.brand} ${p.category_name}`.toLowerCase().includes(q)) return false;
      if (cat !== "all" && p.category_id !== cat) return false;
      if (statusF === "online" && !p.is_active) return false;
      if (statusF === "hidden" && p.is_active) return false;
      if (statusF === "low" && !(p.stock_quantity > 0 && p.stock_quantity <= 5)) return false;
      if (statusF === "out" && p.stock_quantity !== 0) return false;
      return true;
    });
  }, [data, query, cat, statusF]);

  if (!ready || loading) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-400">Chargement…</div>;
  }
  if (!data) return null;

  const { stats } = data;

  return (
    <div className="bg-slate-50/60">
      <div className="mx-auto flex max-w-[110rem] flex-col lg:flex-row">
        {/* Sidebar / topbar */}
        <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between p-4 lg:flex-col lg:items-stretch lg:gap-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 font-display text-lg font-extrabold text-white">
                A
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold text-ink">Administration</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            <nav className="hidden flex-1 flex-col gap-1 lg:flex">
              <SideLink active label="Produits" icon="📦" />
              <Link href="/admin/commandes" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                <span>🧾</span> Commandes
              </Link>
              <Link href="/admin/paiements" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                <span>💳</span> Paiements
              </Link>
              <Link href="/admin/livraison" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                <span>🛵</span> Livraison
              </Link>
              <button onClick={openCreate}
                className="mt-1 flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
                <span className="text-base leading-none">＋</span> Nouveau produit
              </button>
              <a href="/boutique" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                <span>🛍️</span> Voir la boutique
              </a>
            </nav>

            <button onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 lg:mt-auto">
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Contenu */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Catalogue produits</h1>
              <p className="text-sm text-slate-500">Gérez le catalogue depuis votre téléphone ou votre ordinateur.</p>
            </div>
            <button onClick={openCreate}
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
              + Ajouter un produit
            </button>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Produits" value={stats.products} />
            <StatCard label="En ligne" value={stats.online} tone="green" />
            <StatCard label="Unités en stock" value={stats.stock_units} />
            <StatCard label="Stock faible" value={stats.low_stock} tone="amber" />
            <StatCard label="Ruptures" value={stats.out_of_stock} tone="red" />
            <StatCard label="Commandes" value={stats.orders} tone="brand" />
          </div>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
              </svg>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none">
              <option value="all">Toutes catégories</option>
              {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={statusF} onChange={(e) => setStatusF(e.target.value as StatusFilter)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none">
              <option value="all">Tous les statuts</option>
              <option value="online">En ligne</option>
              <option value="hidden">Masqués</option>
              <option value="low">Stock faible</option>
              <option value="out">Ruptures</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            <div className="hidden grid-cols-[1fr_130px_110px_120px_110px] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
              <span>Produit</span><span>Prix (FCFA)</span><span>Stock</span><span>Statut</span>
              <span className="text-right">Actions</span>
            </div>
            {filtered.map((p) => (
              <ProductRow key={p.id} product={p} onSaved={load} onEdit={() => openEdit(p)} />
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-14 text-center text-sm text-slate-400">
                {data.products.length === 0 ? "Aucun produit." : "Aucun produit ne correspond à votre recherche."}
              </p>
            )}
          </div>
        </main>
      </div>

      <ProductDrawer open={drawerOpen} product={editing} categories={data.categories}
        onClose={() => setDrawerOpen(false)} onSaved={load} />
    </div>
  );
}

function SideLink({ label, icon, active }: { label: string; icon: string; active?: boolean }) {
  return (
    <span className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${active ? "bg-slate-100 text-ink" : "text-slate-600"}`}>
      <span>{icon}</span> {label}
    </span>
  );
}

function StatCard({ label, value, tone = "slate" }: { label: string; value: number; tone?: "slate" | "green" | "amber" | "red" | "brand" }) {
  const tones: Record<string, string> = {
    slate: "text-ink", green: "text-cmr-green", amber: "text-amber-600", red: "text-red-600", brand: "text-brand-600",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <p className={`font-display text-2xl font-extrabold ${tones[tone]}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ProductRow({ product, onSaved, onEdit }: { product: VendorProduct; onSaved: () => void; onEdit: () => void }) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock_quantity));
  const [active, setActive] = useState(product.is_active);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPrice(String(product.price));
    setStock(String(product.stock_quantity));
    setActive(product.is_active);
  }, [product.price, product.stock_quantity, product.is_active]);

  const dirty = price !== String(product.price) || stock !== String(product.stock_quantity);

  async function save() {
    setBusy(true);
    try {
      await updateProduct(product.id, { price: Number(price), stock_quantity: Number(stock) });
      onSaved();
    } finally {
      setBusy(false);
    }
  }
  async function toggle() {
    setBusy(true);
    setActive((v) => !v);
    try {
      await updateProduct(product.id, { is_active: !active });
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-2 items-center gap-2 border-t border-slate-100 px-4 py-3 first:border-t-0 md:grid-cols-[1fr_130px_110px_120px_110px]">
      <div className="col-span-2 flex items-center gap-3 md:col-span-1">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {product.image && <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
          <p className="text-xs text-slate-400">{product.category_name}{product.badge ? ` · ${product.badge}` : ""}</p>
        </div>
      </div>
      <label className="flex items-center gap-1 md:block">
        <span className="text-xs text-slate-400 md:hidden">Prix</span>
        <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none" />
      </label>
      <label className="flex items-center gap-1 md:block">
        <span className="text-xs text-slate-400 md:hidden">Stock</span>
        <input value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
          className={`w-full rounded-lg border px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none ${Number(stock) === 0 ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200"}`} />
      </label>
      <button onClick={toggle} disabled={busy}
        className={`justify-self-start rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
        {active ? "● En ligne" : "○ Masqué"}
      </button>
      <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
        {dirty && (
          <button onClick={save} disabled={busy}
            className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30">Enregistrer</button>
        )}
        <button onClick={onEdit}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Éditer
        </button>
      </div>
    </div>
  );
}
