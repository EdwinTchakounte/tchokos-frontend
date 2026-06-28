"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { getSiteConfig, getDeliveryZones, postOrder } from "@/lib/api";
import { formatPrice, whatsappLink } from "@/lib/format";
import type { SiteConfig, DeliveryZone } from "@/lib/types";

export default function CartPage() {
  const { items, ready, subtotal, count, setQuantity, removeItem, clear } = useCart();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSiteConfig().then(setConfig).catch(() => setConfig(null));
    getDeliveryZones().then(setZones).catch(() => setZones([]));
  }, []);

  const selectedZone = zones.find((z) => z.id === zoneId) ?? null;
  const deliveryFee = selectedZone ? Number(selectedZone.fee) : 0;
  const grandTotal = subtotal + deliveryFee;

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
        note: form.note,
        zone_id: zoneId,
        items: items.map((it) => ({ product_id: it.id, quantity: it.quantity, size: it.size })),
      });
      clear();
      if (res.whatsapp_link) {
        window.location.href = res.whatsapp_link;
        return;
      }
      throw new Error("no link");
    } catch {
      if (config?.whatsapp_number) {
        const lines = items
          .map((it) => `• ${it.quantity} × ${it.name}${it.size ? ` (taille ${it.size})` : ""} — ${formatPrice(it.price * it.quantity)}`)
          .join("\n");
        const deliveryTxt = selectedZone
          ? `\nLivraison (${selectedZone.name}) : ${formatPrice(deliveryFee)}\nTotal à payer : ${formatPrice(grandTotal)}`
          : "";
        const msg =
          `Bonjour Tchokos 👋\nJe souhaite commander :\n${lines}\n\n` +
          `Sous-total : ${formatPrice(subtotal)}${deliveryTxt}\nNom : ${form.name}` +
          (selectedZone ? `\nZone : ${selectedZone.name}` : "");
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
      <div className="container-tchokos py-16 text-center sm:py-24">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-50 text-4xl">🛒</span>
        <h1 className="mt-5 font-display text-xl font-extrabold text-ink sm:text-2xl">
          Votre panier est vide
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Parcourez le catalogue et ajoutez vos chaussures et vêtements préférés.
        </p>
        <Link
          href="/boutique"
          className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Découvrir la boutique →
        </Link>
      </div>
    );
  }

  return (
    <div className="container-tchokos py-8 sm:py-10">
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Mon panier</h1>
        <span className="text-sm text-slate-500">{count} article{count > 1 ? "s" : ""}</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Lignes */}
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={`${it.id}-${it.size}`}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-card sm:gap-4"
            >
              <Link href={`/produit/${it.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                {it.image && <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/produit/${it.slug}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-brand-700">
                    {it.name}
                  </Link>
                  <button
                    onClick={() => removeItem(it.id, it.size)}
                    aria-label="Retirer"
                    className="shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h16M9 7V5h6v2m-7 0l1 13h6l1-13" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {it.size && (
                  <span className="mt-1 inline-flex w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                    Taille {it.size}
                  </span>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex items-center rounded-full border border-slate-200">
                    <button onClick={() => setQuantity(it.id, it.size, it.quantity - 1)} className="grid h-8 w-8 place-items-center text-lg" aria-label="Diminuer">−</button>
                    <span className="w-7 text-center text-sm font-semibold">{it.quantity}</span>
                    <button onClick={() => setQuantity(it.id, it.size, it.quantity + 1)} className="grid h-8 w-8 place-items-center text-lg" aria-label="Augmenter">+</button>
                  </div>
                  <span className="font-display text-base font-bold text-ink">{formatPrice(it.price * it.quantity)}</span>
                </div>
              </div>
            </li>
          ))}

          <button onClick={clear} className="text-xs text-slate-400 hover:text-red-600">Vider le panier</button>
        </ul>

        {/* Récap + checkout */}
        <form
          onSubmit={handleCheckout}
          className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:sticky lg:top-28"
        >
          <h2 className="font-display text-lg font-bold text-ink">Finaliser la commande</h2>

          <div className="mt-4 space-y-2.5">
            <input required value={form.name} onChange={update("name")} placeholder="Votre nom *"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            <input required value={form.phone} onChange={update("phone")} placeholder="Téléphone *" inputMode="tel"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            <select value={zoneId ?? ""} onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none">
              <option value="">Zone de livraison (Douala)…</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name} — {formatPrice(z.fee)} (~{z.eta_minutes} min)</option>
              ))}
            </select>
            <textarea value={form.note} onChange={update("note")} placeholder="Note / adresse précise (optionnel)" rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Sous-total</span>
              <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Livraison{selectedZone ? ` · ${selectedZone.name}` : ""}</span>
              <span className="font-medium text-ink">{selectedZone ? formatPrice(deliveryFee) : "à choisir"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="font-semibold text-ink">Total à payer</span>
              <span className="font-display text-xl font-extrabold text-brand-700">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cmr-green px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-cmr-green-dark disabled:opacity-60">
            {loading ? "Préparation…" : "Commander sur WhatsApp"}
          </button>

          {/* Réassurance */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
            <Reassure icon="🛵" label="Livraison Douala" />
            <Reassure icon="📱" label="Mobile Money" />
            <Reassure icon="✅" label="Sans compte" />
          </div>
        </form>
      </div>
    </div>
  );
}

function Reassure({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] leading-tight text-slate-500">{label}</span>
    </div>
  );
}
