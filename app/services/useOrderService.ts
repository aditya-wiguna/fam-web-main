import { useState, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { api } from "./api";
import { ProfileContext } from "../contexts";

export interface Order {
  id: string;
  type: "SUBSCRIPTION" | "REDEMPTION";
  status: "CLOSED" | "PROCESSING" | "CANCELLED" | string;
  product: { id: string; name: string };
  fundName?: string;
  amount?: number;
  unit?: number;
  currency?: string;
  settlementAmount?: number;
  createdDate: string;
  ownerId?: string;
}

interface PaginatedOrders {
  content: Order[];
  totalPages: number;
  totalElements: number;
}

export function useOrderService() {
  const { t } = useTranslation();
  const { profile } = useContext(ProfileContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const list = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<Order[]>("/product/v1/orders?sortOrders=-createdDate");
      setLoading(false);
      return result || [];
    } catch (e) {
      console.error("Error loading orders", e);
      setError(t("orders:error.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const find = useCallback(async (pageNumber = 0, pageSize = 10, type = "") => {
    try {
      setError("");
      setLoading(true);
      const apiPath = `/product/v1/orders/pagination?sortOrders=-createdDate&pageNumber=${pageNumber}&pageSize=${pageSize}`;
      const queryList = profile?.id ? [`ownerId==${profile.id}`] : [];
      if (type) {
        queryList.push(`type==${type}`);
      }
      const queryText = queryList.length > 0 ? `&query=${queryList.join(";")}` : "";
      const result = await api.get<PaginatedOrders>(apiPath + queryText);
      setLoading(false);
      return {
        content: result.content,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
      };
    } catch (e) {
      console.error("Error finding orders", e);
      setError(t("orders:error.load"));
      setLoading(false);
      throw e;
    }
  }, [t, profile]);

  const save = useCallback(async (order: Record<string, unknown>) => {
    try {
      setError("");
      setLoading(true);
      const data = await api.post<Order>("/product/v1/orders", order);
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error saving order", e);
      setError(t("orders:error.save"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  return { list, find, save, loading, error };
}

export default useOrderService;
