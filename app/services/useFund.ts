import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "./api";
import type { Fund } from "./useFundService";

export function useFund(id: string | null) {
  const { t } = useTranslation();
  const [fund, setFund] = useState<Fund | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadFund = async () => {
      try {
        setError("");
        setLoading(true);
        const result = await api.get<Fund[]>(`/product/v1/funds?query=id==${id}`);
        if (result.length > 0) {
          setFund({ ...result[0] });
        } else {
          throw new Error("Fund not found");
        }
      } catch (e) {
        console.error("Error loading fund", e);
        setError(t("common:error.fund.load"));
      } finally {
        setLoading(false);
      }
    };

    loadFund();
  }, [id, t]);

  return { fund, loading, error };
}

export default useFund;
