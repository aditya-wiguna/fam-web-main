import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "./api";

export const FundPerformanceType = {
  OneMonth: { value: "ONE_MONTH", label: "1M" },
  ThreeMonths: { value: "THREE_MONTHS", label: "3M" },
  SixMonths: { value: "SIX_MONTHS", label: "6M" },
  OneYear: { value: "ONE_YEAR", label: "1Y" },
  ThreeYears: { value: "THREE_YEARS", label: "3Y" },
  SinceInception: { value: "SINCE_INCEPTION", label: "All" },
};

const allPerformanceTypes = Object.values(FundPerformanceType);
const minPerformanceDataSize = 3;

export interface Fund {
  id: string;
  name: string;
  currency: string;
  nav: number;
  riskRating: number;
  suitability: number;
  description?: string;
  active: boolean;
  factsheetUrl?: string;
  minSubscription?: number;
  minRedemption?: number;
  performanceYTD?: number;
  performanceSinceInception?: number;
  caseStudies?: Array<{ id: string; title: string; content: unknown }>;
  additionalInfo?: {
    characteristic?: unknown;
    whatHappened?: unknown;
    whatWillHappen?: unknown;
    shouldIPurchase?: unknown;
  };
}

interface PerformanceData {
  date: string;
  value: number;
}

export function useFundService() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const get = useCallback(async (id: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<Fund[]>(`/product/v1/funds?query=id==${id}`);
      let data: Fund | null = null;
      if (result.length > 0) {
        data = { ...result[0] };
      } else {
        setError(t("common:error.fund.load"));
      }
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error loading fund", e);
      setError(t("common:error.fund.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const getPerformanceTypes = useCallback(async (id: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<Record<string, { dataSize?: number }>>(`/product/v1/funds/${id}/performance-types`);
      const data = allPerformanceTypes.filter(({ value }) => {
        return result[value]?.dataSize && result[value].dataSize! >= minPerformanceDataSize;
      });
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error loading fund performance types", e);
      setError(t("common:error.fund.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const getPerformance = useCallback(async (id: string, type = "ONE_MONTH") => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<PerformanceData[]>(`/product/v1/funds/${id}/performances?type=${type}`);
      setLoading(false);
      return [...result];
    } catch (e) {
      console.error("Error loading fund performance", e);
      setError(t("common:error.fund.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  return { get, getPerformanceTypes, getPerformance, loading, error };
}

export default useFundService;
