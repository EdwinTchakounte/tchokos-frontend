import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

import { getSiteConfig, getCategories } from "@/lib/api";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { MobileNav } from "@/components/MobileNav";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { PWARegister } from "@/components/PWARegister";
import { ChatBot } from "@/components/ChatBot";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://tchokos.cm"),
  title: {
    default: "Tchokos — Chaussures & vêtements au Cameroun",
    template: "%s · Tchokos",
  },
  description:
    "La marque chaussures & vêtements du Cameroun. Des milliers de modèles, " +
    "commande facile via WhatsApp, livraison à Douala.",
  keywords: ["chaussures", "vêtements", "Cameroun", "Douala", "Tchokos", "mode"],
  openGraph: {
    title: "Tchokos — Chaussures & vêtements au Cameroun",
    description:
      "Des milliers de modèles, commande facile via WhatsApp, livraison à Douala.",
    locale: "fr_CM",
    type: "website",
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
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Données globales partagées (réglages marque + nav catégories)
  const [config, categories] = await Promise.all([
    getSiteConfig().catch(() => null),
    getCategories().catch(() => []),
  ]);

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-ink pb-14 md:pb-0">
        <BackgroundDecor />
        <CartProvider>
          <Header config={config} categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer config={config} categories={categories} />
          {config?.whatsapp_number ? (
            <WhatsAppFloat number={config.whatsapp_number} />
          ) : null}
          <MobileNav />
          <ChatBot />
        </CartProvider>
        <PWARegister />
      </body>
    </html>
  );
}
