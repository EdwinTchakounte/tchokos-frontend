// Service worker Tchokos — offline léger + installation PWA.
//
// STRATÉGIE (corrigée) : « network-first » pour tout ce qui est dynamique
// (navigations HTML et bundles /_next/...). On ne sert le cache QUE si le réseau
// échoue (mode hors-ligne). Ainsi le JS exécuté correspond TOUJOURS au HTML
// courant : plus de bundle périmé qui casse l'hydratation React (boutons morts).
//
// « cache-first » est réservé aux ressources réellement immuables (logo, icônes).
//
// AUTO-RÉPARATION : lors d'une MISE À JOUR (un ancien cache existait), le nouveau
// SW purge l'ancien cache PUIS force le rechargement des onglets ouverts, pour
// remplacer immédiatement tout code périmé hérité d'une version précédente.
const VERSION = "v4";
const CACHE = `tchokos-${VERSION}`;
const PRECACHE = ["/logo-tchokos.svg", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const stale = keys.filter((k) => k !== CACHE);
      await Promise.all(stale.map((k) => caches.delete(k)));
      await self.clients.claim();

      // Mise à jour depuis une version précédente → on recharge les onglets
      // ouverts pour évacuer tout JS périmé (corrige « rien n'est cliquable »).
      if (stale.length > 0) {
        const clients = await self.clients.matchAll({ type: "window" });
        await Promise.all(
          clients.map((c) => {
            try {
              return c.navigate(c.url).catch(() => {});
            } catch {
              return Promise.resolve();
            }
          })
        );
      }
    })()
  );
});

// Permet à la page de forcer l'activation du nouveau SW sans attendre.
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});

function networkFirst(request) {
  return fetch(request)
    .then((res) => {
      if (res && res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
      }
      return res;
    })
    .catch(() =>
      caches.match(request).then((r) => r || (request.mode === "navigate" ? caches.match("/") : undefined))
    );
}

function cacheFirst(request) {
  return caches.match(request).then(
    (cached) =>
      cached ||
      fetch(request).then((res) => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        }
        return res;
      })
  );
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // On n'intercepte ni l'API, ni le HMR de dev, ni les autres origines.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes("webpack-hmr") ||
    url.pathname.startsWith("/__next") ||
    url.pathname.startsWith("/_next/webpack")
  ) {
    return;
  }

  // Logo + icônes : immuables → cache-first.
  if (PRECACHE.includes(url.pathname)) {
    e.respondWith(cacheFirst(request));
    return;
  }

  // Tout le reste (navigations + /_next/... + reste du statique) : network-first.
  e.respondWith(networkFirst(request));
});
