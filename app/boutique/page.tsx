import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories, getProducts, type SortOption } from "@/lib/api";
import { BoutiqueControls } from "@/components/BoutiqueControls";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Toutes les chaussures et vêtements Tchokos. Filtrez, triez, commandez via WhatsApp.",
  alternates: { canonical: "/boutique" },
};

type Props = {
  searchParams: Promise<{
    categorie?: string;
    recherche?: string;
    cible?: string;
    prix_min?: string;
    prix_max?: string;
    promo?: string;
    stock?: string;
    tri?: string;
  }>;
};

const SORT_MAP: Record<string, SortOption> = {
  "prix-asc": "price_asc",
  "prix-desc": "price_desc",
  nom: "name",
};

export default async function BoutiquePage({ searchParams }: Props) {
  const sp = await searchParams;
  const minPrice = sp.prix_min ? Number(sp.prix_min) : undefined;
  const maxPrice = sp.prix_max ? Number(sp.prix_max) : undefined;

  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts({
      category: sp.categorie,
      search: sp.recherche,
      target: sp.cible,
      onSale: sp.promo === "1",
      inStock: sp.stock === "1",
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      sort: sp.tri ? SORT_MAP[sp.tri] : undefined,
    }).catch(() => []),
  ]);

  return (
    <div className="container-tchokos py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
          {sp.recherche ? `Recherche : « ${sp.recherche} »` : "La boutique"}
        </h1>
        <p className="mt-1 text-slate-500">
          {products.length} article{products.length > 1 ? "s" : ""} disponible
          {products.length > 1 ? "s" : ""}
        </p>
      </header>

      <Suspense fallback={null}>
        <BoutiqueControls products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
