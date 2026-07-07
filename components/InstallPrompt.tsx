"use client";

import { useEffect, useState } from "react";

/**
 * Dialogue « Installer l'application » affiché AU CHARGEMENT.
 *
 * Au démarrage, on demande à l'utilisateur s'il veut installer Tchokos sur son
 * téléphone (Oui / Non).
 *  - Android / Chrome / Edge : « Oui » déclenche l'invite d'installation NATIVE
 *    (via l'événement `beforeinstallprompt` capté au préalable).
 *  - iOS / Safari : pas d'invite native → « Oui » affiche la marche à suivre
 *    (Partager ▸ « Sur l'écran d'accueil »).
 *  - Le choix est mémorisé (localStorage) : on ne redemande pas à chaque visite.
 *  - Jamais affiché si l'app est déjà installée (mode standalone).
 */
type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

const CHOICE_KEY = "tchokos-install-choice"; // "yes" | "no"

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"ask" | "ios">("ask");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error — propriété Safari iOS non typée
      window.navigator.standalone === true;
    if (standalone) return;
    if (localStorage.getItem(CHOICE_KEY)) return; // déjà répondu

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    const isMobile = ios || /android|mobile/.test(ua);
    setIsIOS(ios);

    // Capte l'invite native (Android) si elle se présente.
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setOpen(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", () => closeWith("yes"));

    // On pose la question au chargement (léger délai pour laisser le navigateur
    // émettre `beforeinstallprompt`). On n'ouvre que sur mobile/installable.
    const t = window.setTimeout(() => {
      if (ios || isMobile) setOpen(true);
    }, 1200);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeWith(choice: "yes" | "no") {
    try {
      localStorage.setItem(CHOICE_KEY, choice);
    } catch {}
    setOpen(false);
  }

  async function accept() {
    if (deferred) {
      await deferred.prompt();
      const res = await deferred.userChoice.catch(() => null);
      setDeferred(null);
      closeWith(res?.outcome === "accepted" ? "yes" : "no");
      return;
    }
    if (isIOS) {
      // Pas d'invite native sur iOS : on montre la marche à suivre.
      setStep("ios");
      return;
    }
    // Repli (l'invite native n'est pas encore prête) : on garde la fenêtre,
    // l'utilisateur pourra réessayer, ou installer via le menu du navigateur.
    setStep("ios");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Installer l'application Tchokos"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <img src="/logo-tchokos.svg" alt="Tchokos" className="h-16 w-16 rounded-2xl" />

          {step === "ask" ? (
            <>
              <h2 className="mt-4 font-display text-xl font-extrabold text-ink">
                Installer l&apos;application&nbsp;?
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Ajoutez Tchokos à votre téléphone pour un accès rapide, en plein
                écran et même hors connexion.
              </p>
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <button
                  onClick={() => closeWith("no")}
                  className="rounded-full border border-slate-200 px-4 py-3 font-semibold text-ink-soft transition hover:bg-slate-50 active:scale-95"
                >
                  Non merci
                </button>
                <button
                  onClick={accept}
                  className="rounded-full bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 active:scale-95"
                >
                  Oui, installer
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-4 font-display text-xl font-extrabold text-ink">
                Ajouter à l&apos;écran d&apos;accueil
              </h2>
              <ol className="mt-3 space-y-2 text-left text-sm text-ink-soft">
                <li>
                  1. Touchez le bouton <strong>Partager</strong>{" "}
                  <span className="inline-block align-middle">⬆️</span> de votre
                  navigateur.
                </li>
                <li>
                  2. Choisissez <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
                </li>
                <li>
                  3. Validez avec <strong>Ajouter</strong>.
                </li>
              </ol>
              <button
                onClick={() => closeWith("yes")}
                className="mt-6 w-full rounded-full bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 active:scale-95"
              >
                C&apos;est compris
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
