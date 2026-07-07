"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/admin/apercu", label: "Vue d'ensemble", icon: "📊" },
  { href: "/admin", label: "Produits", icon: "📦" },
  { href: "/admin/commandes", label: "Commandes", icon: "🧾" },
  { href: "/admin/paiements", label: "Paiements", icon: "💳" },
  { href: "/admin/livraison", label: "Livraison", icon: "🛵" },
];

/**
 * Coquille commune de l'espace admin : garde d'authentification (redirige les
 * non-admins vers la connexion), barre latérale de navigation et déconnexion.
 * Les pages passent leur contenu en `children`.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, isAdmin, user, logout } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!isAdmin) router.replace(`/connexion?next=${encodeURIComponent(pathname)}`);
  }, [ready, isAdmin, router, pathname]);

  async function handleLogout() {
    await logout();
    router.replace("/connexion");
  }

  if (!ready) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-400">Chargement…</div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="bg-slate-50/60">
      <div className="mx-auto flex max-w-[110rem] flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 p-4 lg:flex-col lg:items-stretch lg:gap-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 font-display text-lg font-extrabold text-white">
                A
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold text-ink">Administration</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            <nav className="flex flex-1 gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {NAV.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      active ? "bg-slate-100 text-ink" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.icon}</span> {item.label}
                  </Link>
                );
              })}
              <a
                href="/boutique"
                className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <span>🛍️</span> Voir la boutique
              </a>
            </nav>

            <button
              onClick={handleLogout}
              className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 lg:mt-auto"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
