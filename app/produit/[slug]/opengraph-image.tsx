import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getProduct, API_URL } from "@/lib/api";
import { formatPrice } from "@/lib/format";

// Carte de partage réseaux sociaux (Facebook / WhatsApp) générée à la volée :
// photo du produit + nom + prix + logo Tchokos, sur fond blanc avec le liseré
// tricolore camerounais. C'est CETTE image qui part en aperçu quand on partage
// le lien du produit. Convention Next : ce fichier alimente <meta og:image>.
export const runtime = "nodejs";
export const alt = "Produit Tchokos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Couleurs du drapeau camerounais (identité Tchokos).
const CMR_GREEN = "#0a8754";
const CMR_RED = "#ce1126";
const CMR_YELLOW = "#fcd116";

/**
 * Normalise l'URL d'image renvoyée par l'API :
 * - relative → préfixée par API_URL ;
 * - image `/media/…` de Django → on force l'hôte de l'API (les URLs stockées
 *   peuvent porter une IP LAN obsolète, injoignable depuis le serveur Next) ;
 * - CDN externe (ex. Unsplash) → inchangé.
 */
function resolveImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  try {
    const u = new URL(src, API_URL);
    if (u.pathname.includes("/media/")) {
      const api = new URL(API_URL);
      u.protocol = api.protocol;
      u.host = api.host;
    }
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Télécharge l'image et la renvoie en data-URI. On force `Accept: jpeg/png`
 * (le moteur de rendu ne décode pas WebP/AVIF) et on vérifie le content-type.
 * Le fetch nous-mêmes est plus fiable que de laisser le moteur charger l'URL.
 */
async function loadImageDataUri(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: { Accept: "image/jpeg,image/png,image/*;q=0.8" },
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "image/jpeg";
    if (!ct.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${ct};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  // Repli : produit introuvable → carte de marque générique.
  const name = product
    ? product.name.length > 72
      ? `${product.name.slice(0, 70)}…`
      : product.name
    : "Tchokos";
  const category = product?.category_name ?? "Boutique en ligne";
  const priceLabel = product ? formatPrice(product.price) : "";
  const compareLabel =
    product?.compare_at_price != null
      ? formatPrice(product.compare_at_price)
      : null;

  const photo = await loadImageDataUri(
    resolveImageUrl(
      product?.images?.find((i) => i.is_primary)?.image ??
        product?.images?.[0]?.image ??
        product?.image,
    ),
  );

  // Logo Tchokos (PNG local). En repli on affiche juste le nom en texte.
  let logoSrc: string | null = null;
  try {
    const b64 = await readFile(
      join(process.cwd(), "public/icon-512.png"),
      "base64",
    );
    logoSrc = `data:image/png;base64,${b64}`;
  } catch {
    logoSrc = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Liseré tricolore camerounais */}
        <div style={{ display: "flex", flexDirection: "column", width: 16 }}>
          <div style={{ flex: 1, backgroundColor: CMR_GREEN }} />
          <div style={{ flex: 1, backgroundColor: CMR_RED }} />
          <div style={{ flex: 1, backgroundColor: CMR_YELLOW }} />
        </div>

        {/* Photo du produit */}
        <div
          style={{
            display: "flex",
            width: 520,
            height: 630,
            backgroundColor: "#f1f5f9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              width={520}
              height={630}
              style={{ objectFit: "cover" }}
              alt=""
            />
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: 160,
                fontWeight: 800,
                color: CMR_GREEN,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Colonne texte */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "56px 56px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: CMR_GREEN,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Tchokos
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 22,
                color: "#64748b",
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 56,
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.05,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                marginTop: 28,
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 66,
                  fontWeight: 800,
                  color: CMR_GREEN,
                }}
              >
                {priceLabel}
              </div>
              {compareLabel && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    color: "#94a3b8",
                    textDecoration: "line-through",
                  }}
                >
                  {compareLabel}
                </div>
              )}
            </div>
          </div>

          {/* Pied : logo + domaine */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {logoSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                width={60}
                height={60}
                style={{ borderRadius: 14 }}
                alt=""
              />
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                tchokos-sarl.com
              </div>
              <div style={{ display: "flex", fontSize: 20, color: "#64748b" }}>
                Livraison Douala · Paiement Mobile Money
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
