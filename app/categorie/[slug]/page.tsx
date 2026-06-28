import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/api";
import { ProductGrid } from "@/components/ProductGrid";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories().catch(() => []);
  const cat = categories.find((c) => c.slug === slug);
  return {
    title: cat ? cat.name : "Catégorie",
    description: cat?.description || undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts({ category: slug }).catch(() => []),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <div className="container-tchokos py-10">
      <nav className="mb-4 text-sm text-slate-400">
        <a href="/" className="hover:text-brand-600">Accueil</a> /{" "}
        <a href="/boutique" className="hover:text-brand-600">Boutique</a> /{" "}
        <span className="text-ink-soft">{category.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-1 max-w-2xl text-slate-500">{category.description}</p>
        )}
      </header>

      <ProductGrid products={products} />
    </div>
  );
}
