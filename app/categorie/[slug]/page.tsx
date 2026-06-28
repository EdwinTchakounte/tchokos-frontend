import type { Metadata } from "next";
import Image from "next/image";
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
    <div>
      {/* Bannière catégorie */}
      <section className="relative overflow-hidden bg-ink">
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="100vw"
            className="object-cover opacity-45"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="container-tchokos relative py-14 sm:py-20">
          <nav className="mb-3 text-sm text-white/60">
            <a href="/" className="hover:text-white">Accueil</a> /{" "}
            <a href="/boutique" className="hover:text-white">Boutique</a> /{" "}
            <span className="text-white/90">{category.name}</span>
          </nav>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 max-w-xl text-white/80">{category.description}</p>
          )}
          <p className="mt-3 text-sm text-brand-200">
            {products.length} article{products.length > 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <div className="container-tchokos py-10">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
