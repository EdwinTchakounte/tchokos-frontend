"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

/**
 * Ajout rapide depuis une carte produit (sans choix de taille — confirmée
 * ensuite sur WhatsApp). Utilisé à l'intérieur d'un <Link>, d'où le
 * preventDefault/stopPropagation pour ne pas naviguer.
 */
export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.in_stock) return;
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      size: "",
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!product.in_stock}
      aria-label="Ajouter au panier"
      className={`grid h-10 w-10 place-items-center rounded-full shadow-lg ring-1 ring-black/5 transition active:scale-90 disabled:opacity-40 ${
        added ? "bg-cmr-green text-white" : "bg-brand-600 text-white hover:bg-brand-700"
      }`}
    >
      {added ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
