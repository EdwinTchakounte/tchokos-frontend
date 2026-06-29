import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tchokos — Chaussures & mode au Cameroun",
    short_name: "Tchokos",
    description:
      "Le super grossiste chaussures & vêtements d'Akwa, Douala. Commande sur WhatsApp, paiement Mobile Money, livraison à Douala.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#ea580c",
    lang: "fr",
    orientation: "portrait",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
