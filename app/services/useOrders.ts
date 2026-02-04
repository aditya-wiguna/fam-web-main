import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "./api";
import type { Order } from "./useOrderService";

export function useOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setError("");
        setLoading(true);
        const result = await api.get<Order[]>("/product/v1/orders?sortOrders=-createdDate");
        setOrders(result || []);
      } catch (e) {
        console.error("Error loading orders", e);
        setError(t("orders:error.load"));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [t]);

  return { orders, loading, error };
}

export default useOrders;
