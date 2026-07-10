import { renderFlyer } from "@/lib/flyer";

// URL STABLE du flyer produit (PNG 1200x630), réutilisant le rendu partagé.
// Sert au bouton « Partager le flyer » : le client télécharge cette image et la
// partage en FICHIER (status WhatsApp, groupe, post Facebook) via l'API Web Share.
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return renderFlyer(slug);
}
