import { API_URL } from "./api";

export type CourierDeliveryItem = {
  product_name: string;
  quantity: number;
  size: string;
  line_total: string;
};

export type CourierDelivery = {
  id: number;
  status: "pending" | "assigned" | "accepted" | "completed" | "expired" | "cancelled";
  status_display: string;
  code: string;
  acceptance_deadline: string | null;
  remaining_seconds: number | null;
  is_overdue: boolean;
  zone: { name: string; fee: string } | null;
  order: {
    reference: string;
    customer_name: string;
    phone: string;
    address: string;
    note: string;
    total: string;
    delivery_fee: string;
    grand_total: string;
    items: CourierDeliveryItem[];
  };
};

export type CourierSession = {
  token: string;
  courier: { id: number; name: string; phone: string };
};

const KEY = "tchokos_courier_session";

export function getSession(): CourierSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CourierSession) : null;
  } catch {
    return null;
  }
}

function saveSession(s: CourierSession) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function logout() {
  localStorage.removeItem(KEY);
}

export async function courierLogin(phone: string): Promise<CourierSession> {
  const res = await fetch(`${API_URL}/api/courier/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Connexion impossible.");
  }
  const session = (await res.json()) as CourierSession;
  saveSession(session);
  return session;
}

function authHeaders(): HeadersInit {
  const s = getSession();
  return s ? { Authorization: `Bearer ${s.token}` } : {};
}

export async function fetchDeliveries(): Promise<CourierDelivery[]> {
  const res = await fetch(`${API_URL}/api/courier/deliveries/`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error("Erreur de chargement.");
  const data = await res.json();
  return data.deliveries as CourierDelivery[];
}

export async function acceptDelivery(id: number): Promise<string> {
  const res = await fetch(`${API_URL}/api/courier/deliveries/${id}/accept/`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Acceptation impossible.");
  return data.code as string;
}

export async function completeDelivery(id: number, code: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/courier/deliveries/${id}/complete/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Code invalide.");
  }
}
