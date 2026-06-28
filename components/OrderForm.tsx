"use client";

import { useState } from "react";
import { postOrder } from "@/lib/api";
import { formatPrice, whatsappLink } from "@/lib/format";
import type { ProductDetail, SiteConfig } from "@/lib/types";
import { WhatsAppIcon } from "./Header";

type Props = {
  product: ProductDetail;
  config: SiteConfig | null;
};

export function OrderForm({ product, config }: Props) {
  const sizes = product.sizes_list;
  const [size, setSize] = useState<string>(sizes[0] ?? "");
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = Number(product.price) * qty;

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await postOrder({
        customer_name: name,
        phone,
        city,
        items: [{ product_id: product.id, quantity: qty, size }],
      });
      // Le backend renvoie un lien WhatsApp pré-rempli (réf commande incluse)
      if (res.whatsapp_link) {
        window.location.href = res.whatsapp_link;
        return;
      }
      throw new Error("WhatsApp non configuré.");
    } catch {
      // Repli : on construit un lien WhatsApp direct côté client
      if (config?.whatsapp_number) {
        const msg =
          `Bonjour Tchokos 👋\nJe veux commander :\n` +
          `• ${qty} × ${product.name}${size ? ` (taille ${size})` : ""}\n` +
          `Total : ${formatPrice(total)}\nNom : ${name}` +
          (city ? `\nVille : ${city}` : "");
        window.location.href = whatsappLink(config.whatsapp_number, msg);
        return;
      }
      setError("Commande impossible pour le moment. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleOrder} className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Taille</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSize(s)}
                className={`min-w-11 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  size === s
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-2">Quantité</label>
        <div className="inline-flex items-center rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-lg"
            aria-label="Diminuer"
          >
            −
          </button>
          <span className="w-10 text-center font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-2 text-lg"
            aria-label="Augmenter"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre nom *"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Téléphone *"
          inputMode="tel"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ville / quartier"
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none sm:col-span-2"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-500">Total</span>
        <span className="font-display text-xl font-bold text-ink">
          {formatPrice(total)}
        </span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !product.in_stock}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cmr-green px-6 py-3.5 font-semibold text-white hover:bg-cmr-green-dark disabled:opacity-60 transition"
      >
        <WhatsAppIcon className="h-5 w-5" />
        {product.in_stock
          ? loading
            ? "Préparation…"
            : "Commander sur WhatsApp"
          : "Bientôt de retour"}
      </button>
      <p className="text-center text-xs text-slate-400">
        Paiement à la livraison ou Mobile Money · Aucun compte requis
      </p>
    </form>
  );
}
