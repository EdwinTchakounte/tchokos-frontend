import { authedFetch } from "./auth";

/* Données « Mes commandes » renvoyées par GET /api/orders/mine/ */

export type MyOrderItem = {
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type OrderStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "paid"
  | "delivered"
  | "cancelled";

export type MyOrder = {
  reference: string;
  status: OrderStatus;
  status_display: string;
  channel: string;
  total: number;
  delivery_fee: number;
  grand_total: number;
  city: string;
  address: string;
  created_at: string;
  items: MyOrderItem[];
  sendo_status: string; // statut de livraison côté Sendo ("created", "in_transit"…)
  sendo_tracking_token: string;
  tracking_url: string; // page publique de suivi Sendo (vide si pas de colis)
};

/** Commandes du client connecté (lève "unauthorized" si la session est invalide). */
export async function getMyOrders(): Promise<MyOrder[]> {
  const res = await authedFetch("/api/orders/mine/");
  if (!res.ok) throw new Error("Impossible de charger vos commandes.");
  return res.json() as Promise<MyOrder[]>;
}
