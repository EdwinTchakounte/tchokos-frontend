import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

import { getSiteConfig, getCategories } from "@/lib/api";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { MobileNav } from "@/components/MobileNav";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { PWARegister } from "@/components/PWARegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ChatBot } from "@/components/ChatBot";
import { SITE_URL, BRAND, absoluteUrl } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "Tchokos — Chaussures & vêtements au Cameroun";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Tchokos",
  },
  description: BRAND.description,
  keywords: ["chaussures", "vêtements", "Cameroun", "Douala", "Tchokos", "mode"],
  openGraph: {
    title: TITLE,
    description:
      "Des milliers de modèles, commande facile via WhatsApp, livraison à Douala.",
    url: SITE_URL,
    siteName: "Tchokos",
    locale: "fr_CM",
    type: "website",
    images: [
      { url: "/icon-512.png", width: 512, height: 512, alt: "Tchokos" },
    ],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description:
      "Des milliers de modèles, commande facile via WhatsApp, livraison à Douala.",
    images: ["/icon-512.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Tchokos", statusBarStyle: "black-translucent" },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
  viewportFit: "cover", // active env(safe-area-inset-*) sur les écrans à encoche
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Données globales partagées (réglages marque + nav catégories)
  const [config, categories] = await Promise.all([
    getSiteConfig().catch(() => null),
    getCategories().catch(() => []),
  ]);

  // Données structurées globales : identité de l'entreprise + moteur de
  // recherche interne. Rendues une seule fois via le layout racine.
  const sameAs = config?.social
    ? [config.social.facebook, config.social.instagram, config.social.tiktok].filter(Boolean)
    : [];
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: BRAND.name,
    description: BRAND.description,
    url: SITE_URL,
    logo: BRAND.logo,
    image: BRAND.logo,
    ...(config?.phone ? { telephone: config.phone } : {}),
    ...(config?.email ? { email: config.email } : {}),
    ...(config?.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: config.address,
            addressLocality: BRAND.locality,
            addressRegion: BRAND.region,
            addressCountry: BRAND.country,
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: SITE_URL,
    inLanguage: "fr-CM",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/boutique")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-ink pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <BackgroundDecor />
        <AuthProvider>
          <CartProvider>
            <Header config={config} categories={categories} />
            <main className="flex-1">{children}</main>
            <Footer config={config} categories={categories} />
            {config?.whatsapp_number ? (
              <WhatsAppFloat number={config.whatsapp_number} />
            ) : null}
            <MobileNav />
            <ChatBot />
            <InstallPrompt />
          </CartProvider>
        </AuthProvider>
        <PWARegister />
      </body>
    </html>
  );
}
