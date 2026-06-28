/** Formate un prix en francs CFA, ex: "18 000 FCFA". */
export function formatPrice(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "—";
  return `${n.toLocaleString("fr-FR").replace(/ /g, " ")} FCFA`;
}

export const BADGE_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  promo: "Promo",
  bestseller: "Top vente",
  made_in_cmr: "Made in Cameroun",
};

export const BADGE_STYLES: Record<string, string> = {
  nouveau: "bg-cmr-green text-white",
  promo: "bg-brand-600 text-white",
  bestseller: "bg-ink text-white",
  made_in_cmr: "bg-gold text-ink",
};

/** Construit un lien wa.me avec message pré-rempli. */
export function whatsappLink(number: string, message: string): string {
  const clean = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
