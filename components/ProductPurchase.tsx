"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { ProductDetail } from "@/lib/types";

export function ProductPurchase({ product }: { product: ProductDetail }) {
  const sizes = product.sizes_list;
  const router = useRouter();
  const { addItem } = useCart();
  const [size, setSize] = useState<string>(sizes[0] ?? "");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const total = Number(product.price) * qty;

  function add() {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        size,
      },
      qty,
    );
  }

  function handleAdd() {
    add();
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  function handleBuyNow() {
    add();
    router.push("/panier");
  }

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Taille</label>
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

      <div className="flex items-center gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Quantité</label>
          <div className="inline-flex items-center rounded-lg border border-slate-200">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-lg" aria-label="Diminuer">−</button>
            <span className="w-10 text-center font-medium">{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-lg" aria-label="Augmenter">+</button>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-500">Total</p>
          <p className="font-display text-xl font-bold text-ink">{formatPrice(total)}</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.in_stock}
          className={`inline-flex items-center justify-center gap-2 rounded-full border-2 px-5 py-3 font-semibold transition disabled:opacity-60 ${
            justAdded
              ? "border-cmr-green bg-cmr-green text-white"
              : "border-brand-600 text-brand-700 hover:bg-brand-50"
          }`}
        >
          {justAdded ? "Ajouté ✓" : "Ajouter au panier"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!product.in_stock}
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition"
        >
          {product.in_stock ? "Commander maintenant" : "Bientôt de retour"}
        </button>
      </div>
      <p className="text-center text-xs text-slate-400">
        Finalisez votre commande sur WhatsApp · Paiement à la livraison ou Mobile Money
      </p>
    </div>
  );
}
