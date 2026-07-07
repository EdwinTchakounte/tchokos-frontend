// Client ADMIN — Vue d'ensemble (KPIs + séries + livraison). Auth JWT via lib/auth.
import { authedFetch } from "./auth";

export type Overview = {
  kpis: {
    revenue_collected: string;
    total_orders: number;
    paid_orders: number;
    delivered_orders: number;
    avg_basket: string;
    payments_valides: number;
    payments_en_attente: number;
  };
  orders_by_status: Record<string, number>;
  status_labels: Record<string, string>;
  timeseries: { date: string; orders: number; revenue: number }[];
  delivery: {
    pending: number;
    assigned: number;
    in_progress: number;
    completed: number;
    expired: number;
  };
};

export async function getOverview(): Promise<Overview> {
  const res = await authedFetch(`/api/admin/overview/`, { cache: "no-store" });
  if (res.status === 401) throw new Error("unauthorized");
  if (res.status === 403) throw new Error("forbidden");
  if (!res.ok) throw new Error("Erreur de chargement du tableau de bord.");
  return res.json();
}
