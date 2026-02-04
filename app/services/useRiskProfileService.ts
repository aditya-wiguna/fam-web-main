import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "./api";

interface RiskProfileData {
  id?: string;
  riskScore?: number;
  templateId?: string;
  formTemplate?: {
    form?: {
      riskProfiles?: Array<{
        id: string;
        name: string;
        description: string;
        riskRating: string[];
        scoreAssignment: { min: number; max: number };
      }>;
    };
  };
}

export function useRiskProfileService() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = useCallback(async (customerId: string, riskProfile: Record<string, unknown>) => {
    try {
      setError("");
      setLoading(true);
      const data = await api.post<RiskProfileData>(`/customer/v1/customers/${customerId}/risk-profiles`, riskProfile);
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error saving risk profile", e);
      setError(t("common:error.riskProfiles.save"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const get = useCallback(async (customerId: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<RiskProfileData[]>(`/customer/v1/customers/${customerId}/risk-profiles?sortOrders=-createdDate`);
      let data: RiskProfileData | null = null;
      if (result.length > 0) {
        data = { ...result[0] };
      }
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error loading risk profile", e);
      setError(t("common:error.riskProfiles.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const remove = useCallback(async (customerId: string, riskProfileId: string) => {
    try {
      setError("");
      setLoading(true);
      const data = await api.delete(`/customer/v1/customers/${customerId}/risk-profiles/${riskProfileId}`);
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error removing risk profile", e);
      setError(t("common:error.riskProfiles.remove"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const list = useCallback(async (customerId: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<RiskProfileData[]>(`/customer/v1/customers/${customerId}/risk-profiles?sortOrders=-createdDate`);
      setLoading(false);
      return [...result];
    } catch (e) {
      console.error("Error listing risk profiles", e);
      setError(t("common:error.riskProfiles.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  return { save, get, remove, list, loading, error };
}

export default useRiskProfileService;
