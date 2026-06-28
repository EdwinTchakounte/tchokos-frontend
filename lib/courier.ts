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

export type CourierProfile = {
  id: number;
  name: string;
  phone: string;
  city: string;
  vehicle: string;
  is_available: boolean;
  zones: string[];
};

export type CourierStats = {
  assigned: number;
  in_progress: number;
  completed: number;
  to_review: number;
  earnings: string;
  deliveries_total: number;
};

export type CourierZone = { id: number; name: string; fee: string };

export type CourierSession = { token: string; courier: CourierProfile };

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

function authHeaders(): HeadersInit {
  const s = getSession();
  return s ? { Authorization: `Bearer ${s.token}` } : {};
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Erreur.");
  return data;
}

export async function getZones(): Promise<CourierZone[]> {
  const res = await fetch(`${API_URL}/api/courier/zones/`, { cache: "no-store" });
  return res.ok ? res.json() : [];
}

export async function registerCourier(payload: {
  name: string;
  phone: string;
  vehicle: string;
  zone_ids: number[];
}): Promise<void> {
  await post("/api/courier/register/", payload);
}

export async function requestOtp(phone: string): Promise<{ demo_code: string; ttl_minutes: number }> {
  return post("/api/courier/request-otp/", { phone });
}

export async function verifyOtp(phone: string, code: string): Promise<CourierSession> {
  const data = await post("/api/courier/verify-otp/", { phone, code });
  const session = { token: data.token, courier: data.courier } as CourierSession;
  saveSession(session);
  return session;
}

export type CourierDashboard = {
  profile: CourierProfile;
  stats: CourierStats;
  deliveries: CourierDelivery[];
};

export async function fetchDashboard(): Promise<CourierDashboard> {
  const res = await fetch(`${API_URL}/api/courier/deliveries/`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error("Erreur de chargement.");
  return res.json();
}

export async function setAvailability(is_available: boolean): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/courier/availability/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ is_available }),
  });
  const data = await res.json().catch(() => ({}));
  return Boolean(data.is_available);
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
