/**
 * Constantes SEO / marque centralisées.
 *
 * L'URL publique du site (`SITE_URL`) pilote metadataBase, le sitemap, robots,
 * les URLs canoniques et les URLs absolues Open Graph. Elle est lue depuis
 * `NEXT_PUBLIC_SITE_URL` (injectée au build) avec repli sur le domaine de prod.
 * Ne jamais coder une URL de site en dur ailleurs : importer `SITE_URL` d'ici.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tchokos-sarl.com"
).replace(/\/$/, "");

/** Identité de marque réutilisée dans les données structurées (schema.org). */
export const BRAND = {
  name: "Tchokos",
  legalName: "Tchokos",
  description:
    "La marque chaussures & vêtements du Cameroun. Des milliers de modèles, " +
    "commande facile via WhatsApp, livraison à Douala.",
  /** Ville / pays du commerce physique (LocalBusiness). */
  locality: "Douala",
  region: "Littoral",
  country: "CM",
  /** Logo carré absolu (utilisé par Organization + fallback Open Graph). */
  logo: `${SITE_URL}/icon-512.png`,
} as const;

/** Construit une URL absolue à partir d'un chemin relatif (`/boutique`). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
