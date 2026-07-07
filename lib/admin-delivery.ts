// Client back-office ADMIN — livraisons, zones/tarifs, décaissements (JWT via lib/auth).
import { authedFetch } from "./auth";

function guard(res: Response) {
  if (res.status === 401) throw new Error("unauthorized");
  if (res.status === 403) throw new Error("forbidden");
}

export type AdminDelivery = {
  id: number;
  order_reference: string;
  customer_name: string;
  phone: string;
  city: string;
  grand_total: string;
  status: string;
  status_display: string;
  courier: { id: number; name: string } | null;
  zone: { id: number; name: string; fee: string } | null;
  acceptance_deadline: string | null;
  is_overdue: boolean;
  flagged_for_review: boolean;
  created_at: string;
};

export type AdminCourier = {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
  is_available: boolean;
  zones: string[];
};

export type AdminZone = {
  id: number;
  name: string;
  city: string;
  fee: string;
  eta_minutes: number;
  is_active: boolean;
  order: number;
};

export type AdminSettlement = {
  id: number;
  order_reference: string;
  courier: string;
  direction: "courier_to_platform" | "platform_to_courier";
  direction_display: string;
  is_cod: boolean;
  collected: string;
  courier_fee: string;
  amount: string;
  status: "pending" | "settled";
  status_display: string;
  settled_at: string | null;
  note: string;
  created_at: string;
};

export type SettlementSummary = {
  owed_to_platform: string;
  owed_to_couriers: string;
  pending_count: number;
};

export async function getDeliveries(params: { status?: string; q?: string } = {}): Promise<{
  count: number;
  results: AdminDelivery[];
}> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  const res = await authedFetch(`/api/admin/deliveries/?${qs.toString()}`, { cache: "no-store" });
  guard(res);
  if (!res.ok) throw new Error("Erreur de chargement des livraisons.");
  return res.json();
}

export async function getCouriers(): Promise<AdminCourier[]> {
  const res = await authedFetch(`/api/admin/couriers/`, { cache: "no-store" });
  guard(res);
  if (!res.ok) throw new Error("Erreur de chargement des livreurs.");
  return res.json();
}

export async function assignDelivery(id: number, courierId: number): Promise<AdminDelivery> {
  const res = await authedFetch(`/api/admin/deliveries/${id}/assign/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courier_id: courierId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Assignation impossible.");
  return data as AdminDelivery;
}

export async function getZones(): Promise<AdminZone[]> {
  const res = await authedFetch(`/api/admin/delivery-zones/`, { cache: "no-store" });
  guard(res);
  if (!res.ok) throw new Error("Erreur de chargement des zones.");
  return res.json();
}

export async function createZone(payload: {
  name: string;
  fee: number;
  eta_minutes?: number;
  city?: string;
}): Promise<AdminZone> {
  const res = await authedFetch(`/api/admin/delivery-zones/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Création impossible.");
  return data as AdminZone;
}

export async function updateZone(
  id: number,
  patch: Partial<{ name: string; fee: number; eta_minutes: number; is_active: boolean }>,
): Promise<AdminZone> {
  const res = await authedFetch(`/api/admin/delivery-zones/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Mise à jour impossible.");
  return data as AdminZone;
}

export async function getSettlements(params: { status?: string; direction?: string } = {}): Promise<{
  count: number;
  summary: SettlementSummary;
  results: AdminSettlement[];
}> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.direction) qs.set("direction", params.direction);
  const res = await authedFetch(`/api/admin/settlements/?${qs.toString()}`, { cache: "no-store" });
  guard(res);
  if (!res.ok) throw new Error("Erreur de chargement des décaissements.");
  return res.json();
}

export async function settleSettlement(id: number, note = ""): Promise<AdminSettlement> {
  const res = await authedFetch(`/api/admin/settlements/${id}/settle/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Règlement impossible.");
  return data as AdminSettlement;
}
