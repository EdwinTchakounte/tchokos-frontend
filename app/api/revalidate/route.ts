import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Revalidation à la demande de la vitrine.
 * Appelé par le CMS admin après une modification produit (création / édition /
 * suppression / photo) pour que la boutique reflète le changement immédiatement,
 * sans attendre l'expiration du cache ISR.
 */
export async function POST() {
  revalidatePath("/");
  revalidatePath("/boutique");
  revalidatePath("/categorie/[slug]", "page");
  revalidatePath("/produit/[slug]", "page");
  return NextResponse.json({ revalidated: true });
}
