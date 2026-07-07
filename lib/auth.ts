import { API_URL } from "./api";

export type Role = "client" | "courier" | "admin";

export type AuthUser = {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
  is_staff: boolean;
};

type Session = { access: string; refresh: string; user: AuthUser };

const KEY = "tchokos_auth";

/* ----------------------------- storage ----------------------------- */

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function save(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

/** Enregistre une session obtenue ailleurs (ex: inscription livreur qui renvoie déjà les tokens). */
export function setSession(session: Session) {
  save(session);
}

export type { Session };

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function getUser(): AuthUser | null {
  return getSession()?.user ?? null;
}

/* ----------------------------- requêtes auth ----------------------------- */

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data && (data.detail || data.email?.[0] || data.password?.[0] || data.phone?.[0])) ||
      "Une erreur est survenue.";
    throw new Error(msg);
  }
  return data as T;
}

export async function login(email: string, password: string): Promise<Session> {
  const s = await post<Session>("/api/auth/login/", { email, password });
  save(s);
  return s;
}

export async function register(input: {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}): Promise<Session> {
  const s = await post<Session>("/api/auth/register/", input);
  save(s);
  return s;
}

export async function requestOtp(phone: string): Promise<{ detail: string; dev_code?: string }> {
  return post("/api/auth/otp/request/", { phone });
}

export async function verifyOtp(phone: string, code: string): Promise<Session> {
  const s = await post<Session>("/api/auth/otp/verify/", { phone, code });
  save(s);
  return s;
}

export async function requestPasswordReset(email: string): Promise<{ detail: string }> {
  return post("/api/auth/password/reset/", { email });
}

export async function confirmPasswordReset(
  uid: string,
  token: string,
  new_password: string,
): Promise<{ detail: string }> {
  return post("/api/auth/password/reset/confirm/", { uid, token, new_password });
}

export async function logout() {
  const s = getSession();
  if (s?.refresh) {
    try {
      await fetch(`${API_URL}/api/auth/logout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.access}` },
        body: JSON.stringify({ refresh: s.refresh }),
      });
    } catch {
      /* on ignore : on nettoie quand même la session locale */
    }
  }
  clearSession();
}

/* ----------------------------- fetch authentifié + refresh ----------------------------- */

async function refreshAccess(): Promise<string | null> {
  const s = getSession();
  if (!s?.refresh) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: s.refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access: string; refresh?: string };
    save({ ...s, access: data.access, refresh: data.refresh ?? s.refresh });
    return data.access;
  } catch {
    return null;
  }
}

/**
 * fetch avec le token d'accès ; rafraîchit automatiquement une fois en cas de 401.
 * Lève "unauthorized" si la session n'est plus valide.
 */
export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const s = getSession();
  if (!s) throw new Error("unauthorized");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${s.access}`);

  let res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401) {
    const newAccess = await refreshAccess();
    if (!newAccess) {
      clearSession();
      throw new Error("unauthorized");
    }
    headers.set("Authorization", `Bearer ${newAccess}`);
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  }
  return res;
}
