"use client";

import { useEffect } from "react";

/**
 * Gère le service worker de façon SÛRE pour le développement.
 *
 * Problème historique : un SW « cache-first » enregistré une fois servait
 * ensuite des bundles JS périmés (/_next/...) qui ne correspondaient plus au
 * HTML → l'hydratation React échouait silencieusement → plus aucun onClick ne
 * fonctionnait (menu, boutons produit, etc.).
 *
 * Règle désormais :
 *  - en PRODUCTION : on enregistre /sw.js (offline + installation PWA) ;
 *  - en DÉVELOPPEMENT : on DÉSENREGISTRE tout SW existant et on vide les caches,
 *    pour que le navigateur s'auto-répare au prochain rechargement.
 */
export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isProd = process.env.NODE_ENV === "production";

    if (!isProd) {
      // Auto-réparation : on retire les SW et caches laissés par d'anciennes sessions.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
