"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  createProduct,
  getDashboard,
  getSession,
  logout,
  updateProduct,
  type VendorCategory,
  type VendorDashboard,
  type VendorProduct,
} from "@/lib/vendor";
import { formatPrice } from "@/lib/format";

export default function VendorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<VendorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await getDashboard());
    } catch (err) {
      if (err instanceof Error && err.message === "unauthorized") {
        logout();
        router.replace("/vendeur");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/vendeur");
      return;
    }
    load();
  }, [router, load]);

  function handleLogout() {
    logout();
    router.replace("/vendeur");
  }

  if (loading) {
    return <div className="container-tchokos py-20 text-center text-slate-400">Chargement…</div>;
  }
  if (!data) return null;

  const { stats } = data;

  return (
    <div className="container-tchokos py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Espace vendeur</p>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {data.vendor.shop_name}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {showForm ? "Fermer" : "+ Ajouter un produit"}
          </button>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Produits" value={stats.products} />
        <StatCard label="En ligne" value={stats.online} tone="green" />
        <StatCard label="Unités en stock" value={stats.stock_units} />
        <StatCard label="Stock faible" value={stats.low_stock} tone="amber" />
        <StatCard label="Ruptures" value={stats.out_of_stock} tone="red" />
        <StatCard label="Commandes" value={stats.orders} tone="brand" />
      </div>

      {showForm && (
        <AddProductForm
          categories={data.categories}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {/* Liste produits */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-card">
        <div className="hidden grid-cols-[1fr_120px_110px_90px_90px] gap-2 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <span>Produit</span>
          <span>Prix</span>
          <span>Stock</span>
          <span>En ligne</span>
          <span></span>
        </div>
        {data.products.map((p) => (
          <ProductRow key={p.id} product={p} onSaved={load} />
        ))}
        {data.products.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            Aucun produit. Ajoutez votre premier article.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "green" | "amber" | "red" | "brand";
}) {
  const tones: Record<string, string> = {
    slate: "text-ink",
    green: "text-cmr-green",
    amber: "text-amber-600",
    red: "text-red-600",
    brand: "text-brand-600",
  };
  return (
    <div className="rounded-2xl border border-slate-100 p-4 shadow-card">
      <p className={`font-display text-2xl font-extrabold ${tones[tone]}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ProductRow({ product, onSaved }: { product: VendorProduct; onSaved: () => void }) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock_quantity));
  const [active, setActive] = useState(product.is_active);
  const [busy, setBusy] = useState(false);

  const dirty =
    price !== String(product.price) || stock !== String(product.stock_quantity);

  async function save() {
    setBusy(true);
    try {
      await updateProduct(product.id, {
        price: Number(price),
        stock_quantity: Number(stock),
      });
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
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-2 items-center gap-2 border-t border-slate-100 px-4 py-3 md:grid-cols-[1fr_120px_110px_90px_90px]">
      <div className="col-span-2 flex items-center gap-3 md:col-span-1">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {product.image && (
            <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{product.name}</p>
          <p className="text-xs text-slate-400">{product.category_name}</p>
        </div>
      </div>
      <label className="flex items-center gap-1 md:block">
        <span className="text-xs text-slate-400 md:hidden">Prix</span>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </label>
      <label className="flex items-center gap-1 md:block">
        <span className="text-xs text-slate-400 md:hidden">Stock</span>
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </label>
      <button
        onClick={toggle}
        disabled={busy}
        className={`justify-self-start rounded-full px-3 py-1 text-xs font-semibold ${
          active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
        }`}
      >
        {active ? "En ligne" : "Masqué"}
      </button>
      <button
        onClick={save}
        disabled={busy || !dirty}
        className="justify-self-end rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30"
      >
        Enregistrer
      </button>
    </div>
  );
}

function AddProductForm({
  categories,
  onCreated,
}: {
  categories: VendorCategory[];
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    category_id: categories[0]?.id ?? 0,
    price: "",
    stock_quantity: "",
    target: "unisexe",
    image_url: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await createProduct({
        name: form.name,
        category_id: Number(form.category_id),
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity || 0),
        target: form.target,
        image_url: form.image_url,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={submit} className="mb-8 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
      <h3 className="mb-4 font-display text-lg font-bold text-ink">Nouveau produit</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Nom du produit *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`${input} sm:col-span-2`}
        />
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
          className={input}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={form.target}
          onChange={(e) => setForm({ ...form, target: e.target.value })}
          className={input}
        >
          <option value="unisexe">Unisexe</option>
          <option value="femme">Femme</option>
          <option value="homme">Homme</option>
          <option value="enfant">Enfant</option>
        </select>
        <input
          required
          placeholder="Prix FCFA *"
          inputMode="numeric"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })}
          className={input}
        />
        <input
          placeholder="Stock"
          inputMode="numeric"
          value={form.stock_quantity}
          onChange={(e) => setForm({ ...form, stock_quantity: e.target.value.replace(/\D/g, "") })}
          className={input}
        />
        <input
          placeholder="URL d'image (optionnel)"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className={`${input} sm:col-span-2`}
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "Ajout…" : "Ajouter le produit"}
      </button>
    </form>
  );
}
