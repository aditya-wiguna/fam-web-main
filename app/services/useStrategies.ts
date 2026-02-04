import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "./api";

interface Strategy {
  id: string;
  title: string;
  description?: string;
  icon?: {
    url?: string;
  };
  products?: Array<{
    id: string;
    name?: string;
    description?: string;
    type: string;
    fund?: { 
      id: string; 
      name: string; 
      active: boolean; 
      currency?: string; 
      nav?: number; 
      riskRating?: number;
      suitability?: number;
      performanceYTD?: number;
      performanceSinceInception?: number;
    };
  }>;
}

export function useStrategies() {
  const { t } = useTranslation();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        setError("");
        setLoading(true);
        const result = await api.get<Strategy[]>("/product/v1/strategies");
        setStrategies(result || []);
      } catch (e) {
        console.error("Error loading strategies", e);
        setError(t("common:error.strategies.load"));
      } finally {
        setLoading(false);
      }
    };
    loadStrategies();
  }, [t]);

  return { strategies, loading, error };
}

export default useStrategies;
