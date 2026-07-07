import type { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";

/**
 * Sitemap dynamique Tchokos.
 *
 * Combine les pages statiques indexables + une entrée par produit et par
 * catégorie récupérés de l'API. Régénéré selon l'ISR (revalidate des helpers
 * `lib/api`). Les pages privées (admin, compte, panier, connexion…) en sont
 * volontairement absentes — elles sont aussi bloquées dans `robots.ts`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/boutique"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/a-propos"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Catalogue — best-effort : si l'API est indisponible au build, on livre au
  // moins les routes statiques plutôt que de faire échouer la génération.
  const [products, categories] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/categorie/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(`/produit/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
    images: p.image ? [p.image] : undefined,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
