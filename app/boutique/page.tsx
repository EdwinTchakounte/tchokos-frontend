import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Toutes les chaussures et vêtements Tchokos. Commandez via WhatsApp.",
};

type Props = {
  searchParams: Promise<{ categorie?: string; recherche?: string }>;
};

export default async function BoutiquePage({ searchParams }: Props) {
  const { categorie, recherche } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts({ category: categorie, search: recherche }).catch(() => []),
  ]);

  return (
    <div className="container-tchokos py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">
          {recherche ? `Recherche : « ${recherche} »` : "La boutique"}
        </h1>
        <p className="mt-1 text-slate-500">
          {products.length} article{products.length > 1 ? "s" : ""} disponible
          {products.length > 1 ? "s" : ""}
        </p>
      </header>

      {/* Filtres catégories */}
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterPill href="/boutique" active={!categorie} label="Tout" />
        {categories.map((c) => (
          <FilterPill
            key={c.slug}
            href={`/boutique?categorie=${c.slug}`}
            active={categorie === c.slug}
            label={c.name}
          />
        ))}
      </div>

      <ProductGrid products={products} />
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "bg-slate-100 text-ink-soft hover:bg-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}
