"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { requestOtp } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

function destinationFor(user: AuthUser, next: string | null): string {
  if (next) return next;
  if (user.is_staff || user.role === "admin") return "/admin";
  if (user.role === "courier") return "/livreur/courses";
  return "/compte";
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const { login, loginOtp } = useAuth();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(destinationFor(user, next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await requestOtp(phone.trim());
      setOtpSent(true);
      setDevCode(r.dev_code ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await loginOtp(phone.trim(), code.trim());
      router.replace(destinationFor(user, next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code incorrect.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="container-tchokos flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-card">
        <h1 className="font-display text-2xl font-extrabold text-ink">Connexion</h1>
        <p className="mt-1 text-sm text-slate-500">Accédez à votre espace Tchokos.</p>

        {/* Onglets */}
        <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
          <button
            onClick={() => { setMode("password"); setError(null); }}
            className={`rounded-lg py-2 transition ${mode === "password" ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}
          >
            Email + mot de passe
          </button>
          <button
            onClick={() => { setMode("otp"); setError(null); }}
            className={`rounded-lg py-2 transition ${mode === "otp" ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}
          >
            Par téléphone
          </button>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {mode === "password" ? (
          <form onSubmit={submitPassword} className="mt-5 space-y-3">
            <input type="email" required placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} className={input} />
            <input type="password" required placeholder="Mot de passe" value={password}
              onChange={(e) => setPassword(e.target.value)} className={input} />
            <div className="text-right">
              <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-brand-600 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <button type="submit" disabled={busy}
              className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {busy ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? submitOtp : sendOtp} className="mt-5 space-y-3">
            <input type="tel" required placeholder="Téléphone (ex: 237670000001)" value={phone}
              onChange={(e) => setPhone(e.target.value)} className={input} disabled={otpSent} />
            {otpSent && (
              <>
                <input inputMode="numeric" required placeholder="Code à 6 chiffres" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={input} />
                {devCode && (
                  <p className="text-xs text-slate-400">Code de démo : <b>{devCode}</b></p>
                )}
              </>
            )}
            <button type="submit" disabled={busy}
              className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {busy ? "…" : otpSent ? "Valider le code" : "Recevoir un code"}
            </button>
            {otpSent && (
              <button type="button" onClick={() => { setOtpSent(false); setCode(""); setDevCode(null); }}
                className="w-full text-xs text-slate-400 hover:underline">
                Changer de numéro
              </button>
            )}
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-brand-600 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-tchokos py-20 text-center text-slate-400">Chargement…</div>}>
      <LoginInner />
    </Suspense>
  );
}
