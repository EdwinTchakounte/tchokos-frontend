// Client de l'espace livreur — auth unifiée (JWT via lib/auth).
import { API_URL } from "./api";
import { authedFetch, setSession, type AuthUser } from "./auth";

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
  // Le code n'est jamais transmis au livreur (envoyé au client). On sait juste
  // s'il est parti.
  code_sent: boolean;
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

export async function getZones(): Promise<CourierZone[]> {
  const res = await fetch(`${API_URL}/api/courier/zones/`, { cache: "no-store" });
  return res.ok ? res.json() : [];
}

/** Inscription livreur : crée le compte (email+mdp) + le profil, et ouvre la session. */
export async function registerCourier(payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  vehicle: string;
  zone_ids: number[];
}): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/api/courier/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Inscription impossible.");
  setSession({ access: data.access, refresh: data.refresh, user: data.user });
  return data.user as AuthUser;
}

export type CourierDashboard = {
  profile: CourierProfile;
  stats: CourierStats;
  deliveries: CourierDelivery[];
};

export async function fetchDashboard(): Promise<CourierDashboard> {
  const res = await authedFetch("/api/courier/deliveries/", { cache: "no-store" });
  if (res.status === 401) throw new Error("unauthorized");
  if (res.status === 403) throw new Error("forbidden");
  if (!res.ok) throw new Error("Erreur de chargement.");
  return res.json();
}

export async function setAvailability(is_available: boolean): Promise<boolean> {
  const res = await authedFetch("/api/courier/availability/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_available }),
  });
  const data = await res.json().catch(() => ({}));
  return Boolean(data.is_available);
}

export async function acceptDelivery(id: number): Promise<void> {
  const res = await authedFetch(`/api/courier/deliveries/${id}/accept/`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Acceptation impossible.");
}

export async function completeDelivery(id: number, code: string): Promise<void> {
  const res = await authedFetch(`/api/courier/deliveries/${id}/complete/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Code invalide.");
  }
}
