// Rendu partagé du FLYER produit Tchokos (image 1200x630).
//
// Un seul générateur, réutilisé par :
//  - app/produit/[slug]/opengraph-image.tsx  → aperçu au partage du lien (FB/WA)
//  - app/produit/[slug]/twitter-image.tsx     → carte Twitter/X
//  - app/produit/[slug]/flyer/route.tsx       → URL stable, image téléchargeable
//    partageable en FICHIER (status WhatsApp, post Facebook…)
//
// Design « flyer » : photo produit pleine hauteur + badge -X%, panneau marque
// (logo + wordmark TCHOKOS), chip « ON CASSE LE PRIX », nom, prix cassé, pied
// paiement / livraison / suivi, liseré tricolore camerounais. Police Poppins
// embarquée (satori ne lit pas les variables next/font).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getProduct, API_URL } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export const FLYER_SIZE = { width: 1200, height: 630 };
export const FLYER_ALT = "Flyer produit Tchokos — à prix cassé";

// Charte Tchokos (alignée sur globals.css) + tricolore camerounais.
const BRAND_ORANGE = "#ea580c"; // --color-brand-600
const CMR_GREEN = "#15803d"; // --color-cmr-green
const GOLD = "#f59e0b"; // --color-gold
const INK = "#0f172a";
const CMR_RED = "#ce1126";
const CMR_YELLOW = "#fcd116";

function ab(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

/** Normalise l'URL d'image de l'API (relative → absolue ; /media → hôte API). */
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

/** Télécharge une image → data-URI (satori ne décode ni WebP ni AVIF). */
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

async function loadLocalDataUri(rel: string): Promise<string | null> {
  try {
    const b64 = await readFile(join(process.cwd(), rel), "base64");
    return `data:image/png;base64,${b64}`;
  } catch {
    return null;
  }
}

/**
 * Génère le flyer d'un produit et renvoie une `ImageResponse` (= Response PNG).
 * Fraîche à chaque appel (ImageResponse n'est consommable qu'une fois).
 */
export async function renderFlyer(slug: string): Promise<ImageResponse> {
  const product = await getProduct(slug).catch(() => null);

  const name = product
    ? product.name.length > 64
      ? `${product.name.slice(0, 62)}…`
      : product.name
    : "Tchokos";
  const category = product?.category_name ?? "Boutique en ligne";
  const brandName = product?.brand ?? "";
  const priceLabel = product ? formatPrice(product.price) : "";
  const compareLabel =
    product?.compare_at_price != null ? formatPrice(product.compare_at_price) : null;
  const discount = product?.discount_percent && product.discount_percent > 0
    ? product.discount_percent
    : 0;

  const [photo, logo, fontSemi, fontExtra] = await Promise.all([
    loadImageDataUri(
      resolveImageUrl(
        product?.images?.find((i) => i.is_primary)?.image ??
          product?.images?.[0]?.image ??
          product?.image,
      ),
    ),
    loadLocalDataUri("public/icon-512.png"),
    readFile(join(process.cwd(), "public/fonts/Poppins-SemiBold.ttf")),
    readFile(join(process.cwd(), "public/fonts/Poppins-ExtraBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
          fontFamily: "Poppins",
        }}
      >
        {/* Liseré tricolore camerounais (identité) */}
        <div style={{ display: "flex", flexDirection: "column", width: 14 }}>
          <div style={{ flex: 1, backgroundColor: CMR_GREEN }} />
          <div style={{ flex: 1, backgroundColor: CMR_RED }} />
          <div style={{ flex: 1, backgroundColor: CMR_YELLOW }} />
        </div>

        {/* Photo produit pleine hauteur */}
        <div
          style={{
            position: "relative",
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
            <img src={photo} width={520} height={630} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div style={{ display: "flex", fontSize: 200, fontWeight: 800, color: "#cbd5e1" }}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Badge -X% (coin haut-gauche de la photo) */}
          {discount > 0 && (
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 108,
                height: 108,
                borderRadius: 999,
                backgroundColor: CMR_RED,
                color: "#fff",
                border: "4px solid #ffffff",
              }}
            >
              <div style={{ display: "flex", fontSize: 40, fontWeight: 800, lineHeight: 1 }}>
                -{discount}%
              </div>
              <div style={{ display: "flex", fontSize: 15, fontWeight: 600, marginTop: 2 }}>
                REMISE
              </div>
            </div>
          )}
        </div>

        {/* Panneau marque + infos */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "44px 52px",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
          }}
        >
          {/* En-tête : logo + wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} width={64} height={64} style={{ borderRadius: 16 }} alt="" />
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 38,
                  fontWeight: 800,
                  color: BRAND_ORANGE,
                  letterSpacing: 1,
                  lineHeight: 1,
                }}
              >
                TCHOKOS
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#64748b",
                  letterSpacing: 3,
                  marginTop: 4,
                }}
              >
                GROSSISTE · DOUALA
              </div>
            </div>
          </div>

          {/* Corps : chip promo + catégorie + nom + prix */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: GOLD,
                  color: INK,
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: 1,
                  padding: "8px 18px",
                  borderRadius: 999,
                }}
              >
                ON CASSE LE PRIX
              </div>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 20,
                fontWeight: 600,
                color: "#94a3b8",
                letterSpacing: 1,
              }}
            >
              {(brandName || category).toUpperCase()}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 52,
                fontWeight: 800,
                color: INK,
                lineHeight: 1.05,
              }}
            >
              {name}
            </div>

            <div
              style={{ display: "flex", alignItems: "flex-end", marginTop: 22, gap: 18 }}
            >
              <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: CMR_GREEN, lineHeight: 1 }}>
                {priceLabel}
              </div>
              {compareLabel && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 600,
                    color: "#94a3b8",
                    textDecoration: "line-through",
                    paddingBottom: 8,
                  }}
                >
                  {compareLabel}
                </div>
              )}
            </div>
          </div>

          {/* Pied : domaine + réassurance (empilés pour éviter toute coupure) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", height: 2, backgroundColor: "#f1f5f9" }} />
            <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: INK }}>
              tchokos-sarl.com
            </div>
            <div style={{ display: "flex", fontSize: 18, fontWeight: 600, color: "#64748b" }}>
              Mobile Money · Livraison Douala · Suivi colis
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...FLYER_SIZE,
      fonts: [
        { name: "Poppins", data: ab(fontSemi), weight: 600, style: "normal" },
        { name: "Poppins", data: ab(fontExtra), weight: 800, style: "normal" },
      ],
    },
  );
}
