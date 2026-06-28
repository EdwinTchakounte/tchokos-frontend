"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { getSiteConfig, postOrder } from "@/lib/api";
import { formatPrice, whatsappLink } from "@/lib/format";
import type { SiteConfig } from "@/lib/types";

export default function CartPage() {
  const { items, ready, subtotal, setQuantity, removeItem, clear } = useCart();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", city: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSiteConfig().then(setConfig).catch(() => setConfig(null));
  }, []);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await postOrder({
        customer_name: form.name,
        phone: form.phone,
        city: form.city,
        note: form.note,
        items: items.map((it) => ({
          product_id: it.id,
          quantity: it.quantity,
          size: it.size,
        })),
      });
      clear();
      if (res.whatsapp_link) {
        window.location.href = res.whatsapp_link;
        return;
      }
      throw new Error("no link");
    } catch {
      // Repli : lien WhatsApp construit côté client
      if (config?.whatsapp_number) {
        const lines = items
          .map(
            (it) =>
              `• ${it.quantity} × ${it.name}${it.size ? ` (taille ${it.size})` : ""} — ${formatPrice(
                it.price * it.quantity,
              )}`,
          )
          .join("\n");
        const msg =
          `Bonjour Tchokos 👋\nJe souhaite commander :\n${lines}\n\n` +
          `Total : ${formatPrice(subtotal)}\nNom : ${form.name}` +
          (form.city ? `\nVille : ${form.city}` : "");
        clear();
        window.location.href = whatsappLink(config.whatsapp_number, msg);
        return;
      }
      setError("Commande impossible pour le moment. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <div className="container-tchokos py-20 text-center text-slate-400">Chargement…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-tchokos py-20 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">
          Votre panier est vide
        </h1>
        <p className="mt-2 text-slate-500">Découvrez nos chaussures et vêtements.</p>
        <Link
          href="/boutique"
          className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition"
        >
          Aller à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="container-tchokos py-10">
      <h1 className="font-display text-3xl font-extrabold text-ink">Mon panier</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Lignes */}
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={`${it.id}-${it.size}`}
              className="flex gap-4 rounded-2xl border border-slate-100 p-3 shadow-card"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                {it.image && (
                  <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <Link href={`/produit/${it.slug}`} className="font-medium text-ink hover:text-brand-700">
                  {it.name}
                </Link>
                {it.size && <p className="text-xs text-slate-500">Taille : {it.size}</p>}
                <p className="text-sm font-semibold text-ink">{formatPrice(it.price)}</p>

                <div className="mt-auto flex items-center justify-between">
                  <div className="inline-flex items-center rounded-lg border border-slate-200">
                    <button onClick={() => setQuantity(it.id, it.size, it.quantity - 1)} className="px-2.5 py-1 text-lg" aria-label="Diminuer">−</button>
                    <span className="w-8 text-center text-sm font-medium">{it.quantity}</span>
                    <button onClick={() => setQuantity(it.id, it.size, it.quantity + 1)} className="px-2.5 py-1 text-lg" aria-label="Augmenter">+</button>
                  </div>
                  <button
                    onClick={() => removeItem(it.id, it.size)}
                    className="text-xs text-slate-400 hover:text-red-600"
                  >
                    Retirer
                  </button>
                </div>
              </div>
              <div className="hidden sm:block text-right font-semibold text-ink">
                {formatPrice(it.price * it.quantity)}
              </div>
            </li>
          ))}
        </ul>

        {/* Récap + checkout */}
        <form
          onSubmit={handleCheckout}
          className="h-fit rounded-2xl border border-slate-100 p-5 shadow-card lg:sticky lg:top-28"
        >
          <h2 className="font-display text-lg font-bold text-ink">Finaliser la commande</h2>
          <div className="mt-3 flex items-center justify-between border-y border-slate-100 py-3">
            <span className="text-slate-500">Sous-total</span>
            <span className="font-display text-xl font-bold text-ink">{formatPrice(subtotal)}</span>
          </div>

          <div className="mt-4 space-y-3">
            <input required value={form.name} onChange={update("name")} placeholder="Votre nom *"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            <input required value={form.phone} onChange={update("phone")} placeholder="Téléphone *" inputMode="tel"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            <input value={form.city} onChange={update("city")} placeholder="Ville / quartier"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            <textarea value={form.note} onChange={update("note")} placeholder="Note (optionnel)" rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cmr-green px-6 py-3.5 font-semibold text-white hover:bg-cmr-green-dark disabled:opacity-60 transition"
          >
            {loading ? "Préparation…" : "Commander sur WhatsApp"}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Vous serez redirigé vers WhatsApp avec le récapitulatif pré-rempli.
          </p>
        </form>
      </div>
    </div>
  );
}
