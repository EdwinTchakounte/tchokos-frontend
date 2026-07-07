import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Directives crawler Tchokos.
 *
 * On autorise tout le catalogue public et on exclut explicitement les espaces
 * privés / transactionnels (aucune valeur SEO, à ne pas indexer) : back-office,
 * compte client, panier, tunnels d'auth et espace livreur.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/compte",
        "/panier",
        "/connexion",
        "/inscription",
        "/mot-de-passe-oublie",
        "/livreur",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
