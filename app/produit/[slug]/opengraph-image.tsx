import { renderFlyer, FLYER_SIZE, FLYER_ALT } from "@/lib/flyer";

// Carte de partage réseaux sociaux (Facebook / WhatsApp) : c'est CETTE image qui
// part en aperçu quand on partage le lien du produit. Le rendu est mutualisé dans
// `lib/flyer.tsx` (même flyer que la route téléchargeable /produit/[slug]/flyer).
export const runtime = "nodejs";
export const alt = FLYER_ALT;
export const size = FLYER_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderFlyer(slug);
}
