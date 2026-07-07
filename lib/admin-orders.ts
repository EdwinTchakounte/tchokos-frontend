// Client back-office ADMIN — commandes, paiements, ventes (auth JWT via lib/auth).
import { authedFetch } from "./auth";

export type PaymentState = "en_attente" | "valide" | "rejete";

export type AdminOrderRow = {
  id: number;
  reference: string;
  customer_name: string;
  phone: string;
  city: string;
  channel: string;
  channel_display: string;
  status: string;
  status_display: string;
  total: string;
  delivery_fee: string;
  grand_total: string;
  items_count: number;
  payment_status: PaymentState | null;
  created_at: string;
};

export type AdminPayment = {
  id: number;
  montant: string;
  statut: PaymentState;
  statut_display: string;
  source: string;
  provider_code: string;
  reference_externe: string;
  phone: string;
  created_at: string;
  date_validation: string | null;
  order_reference?: string;
  customer_name?: string;
};

export type AdminOrderItem = {
  product_name: string;
  unit_price: string;
  quantity: number;
  size: string;
  line_total: string;
};

export type StatusChoice = { value: string; label: string };

export type AdminOrderDetail = {
  id: number;
  reference: string;
  customer_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  note: string;
  channel: string;
  channel_display: string;
  status: string;
  status_display: string;
  status_choices: StatusChoice[];
  total: string;
  delivery_fee: string;
  grand_total: string;
  created_at: string;
  items: AdminOrderItem[];
  payments: AdminPayment[];
  whatsapp_link: string;
  tracking_token: string;
  sendo_status: string;
  delivery: {
    status: string;
    status_display: string;
    zone: string;
    courier: string;
    code_sent: boolean;
  } | null;
};

export type SalesStats = {
  total_orders: number;
  orders_by_status: Record<string, number>;
  paid_orders: number;
  revenue_collected: string;
  avg_basket: string;
  payments_valides: number;
  payments_en_attente: number;
};

export type Paginated<T> = { count: number; limit: number; offset: number; results: T[] };

function guard(res: Response) {
  if (res.status === 401) throw new Error("unauthorized");
  if (res.status === 403) throw new Error("forbidden");
}

export async function getOrders(params: {
  status?: string;
  channel?: string;
  q?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Paginated<AdminOrderRow>> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.channel) qs.set("channel", params.channel);
  if (params.q) qs.set("q", params.q);
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  const res = await authedFetch(`/api/admin/orders/?${qs.toString()}`, { cache: "no-store" });
  guard(res);
  if (!res.ok) throw new Error("Erreur de chargement des commandes.");
  return res.json();
}

export async function getOrderDetail(id: number): Promise<AdminOrderDetail> {
  const res = await authedFetch(`/api/admin/orders/${id}/`, { cache: "no-store" });
  guard(res);
  if (!res.ok) throw new Error("Commande introuvable.");
  return res.json();
}

export async function updateOrderStatus(
  id: number,
  patch: { status?: string; delivery_fee?: number },
): Promise<AdminOrderDetail> {
  const res = await authedFetch(`/api/admin/orders/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Mise à jour impossible.");
  return data as AdminOrderDetail;
}

export async function contactCustomer(
  id: number,
  payload: { subject?: string; message: string },
): Promise<{ ok: boolean; sent_to: string }> {
  const res = await authedFetch(`/api/admin/orders/${id}/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Envoi impossible.");
  return data;
}

export async function getPayments(params: {
  statut?: string;
  q?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Paginated<AdminPayment>> {
  const qs = new URLSearchParams();
  if (params.statut) qs.set("statut", params.statut);
  if (params.q) qs.set("q", params.q);
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  const res = await authedFetch(`/api/admin/payments/?${qs.toString()}`, { cache: "no-store" });
  guard(res);
  if (!res.ok) throw new Error("Erreur de chargement des paiements.");
  return res.json();
}

export async function getSalesStats(): Promise<SalesStats> {
  const res = await authedFetch(`/api/admin/sales-stats/`, { cache: "no-store" });
  guard(res);
  if (!res.ok) throw new Error("Erreur de chargement des stats.");
  return res.json();
}
