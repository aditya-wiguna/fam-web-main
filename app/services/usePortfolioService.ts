import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "./api";

const PortfolioPerformanceType = {
  OneMonth: { value: "ONE_MONTH", label: "1M" },
  ThreeMonths: { value: "THREE_MONTHS", label: "3M" },
  SixMonths: { value: "SIX_MONTHS", label: "6M" },
  OneYear: { value: "ONE_YEAR", label: "1Y" },
  ThreeYears: { value: "THREE_YEARS", label: "3Y" },
  SinceInception: { value: "SINCE_INCEPTION", label: "All" },
};

const allPerformanceTypes = Object.values(PortfolioPerformanceType);
const minPerformanceDataSize = 3;

interface PortfolioSummary {
  totalAssetValue?: number;
  totalDeposit?: number;
  totalWithdrawal?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

interface PortfolioDetails {
  productId: string;
  productName: string;
  totalNavSGD?: number;
  totalNavUSD?: number;
  depositAmountSGD?: number;
  depositAmountUSD?: number;
  withdrawAmountSGD?: number;
  withdrawAmountUSD?: number;
  classDetails?: Array<{ noOfShares: number }>;
}

export function usePortfolioService() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getSummaryTypes = useCallback(async (customerId: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<Record<string, { dataSize?: number }>>(`/customer/v1/customers/${customerId}/portfolio/overview-types`);
      const data = allPerformanceTypes.filter(({ value }) => {
        return result[value]?.dataSize && result[value].dataSize! >= minPerformanceDataSize;
      });
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error loading portfolio summary types", e);
      setError(t("common:error.portfolio.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const getLatestSummary = useCallback(async (customerId: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<PortfolioSummary>(`/customer/v1/customers/${customerId}/portfolio/latest`);
      setLoading(false);
      return { ...result };
    } catch (e) {
      console.error("Error loading portfolio summary", e);
      setError(t("common:error.portfolio.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const getSummary = useCallback(async (customerId: string, performanceType = "ONE_MONTH") => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<PortfolioSummary>(`/customer/v1/customers/${customerId}/portfolio/overview?type=${performanceType}`);
      setLoading(false);
      return { ...result };
    } catch (e) {
      console.error("Error loading portfolio summary", e);
      setError(t("common:error.portfolio.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const getDetails = useCallback(async (customerId: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<PortfolioDetails[]>(`/customer/v1/customers/${customerId}/portfolio/details`);
      setLoading(false);
      return [...result];
    } catch (e) {
      console.error("Error loading portfolio details", e);
      setError(t("common:error.portfolio.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  return { getSummaryTypes, getLatestSummary, getSummary, getDetails, loading, error };
}

export default usePortfolioService;
