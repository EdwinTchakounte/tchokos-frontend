import type { NextConfig } from "next";

// Hôte du backend (pour les images servies depuis /media en dev/prod)
const apiHost = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
let backendPattern: { protocol: "http" | "https"; hostname: string; port?: string; pathname: string } | null = null;
try {
  const u = new URL(apiHost);
  backendPattern = {
    protocol: u.protocol.replace(":", "") === "https" ? "https" : "http",
    hostname: u.hostname,
    port: u.port || undefined,
    pathname: "/media/**",
  };
} catch {
  backendPattern = null;
}

const nextConfig: NextConfig = {
  // Build autonome pour Docker : génère `.next/standalone` (serveur Node minimal).
  output: "standalone",
  images: {
    remotePatterns: [
      // Images distantes de démo (catalogue)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Backend (photos téléversées dans /media)
      ...(backendPattern ? [backendPattern] : []),
      // Tolérance dev : localhost sur les ports backend usuels
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8010", pathname: "/media/**" },
      // IP LAN (test mobile) : autorise les images media servies via l'IP réseau
      { protocol: "http", hostname: "10.137.226.210", port: "8010", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
