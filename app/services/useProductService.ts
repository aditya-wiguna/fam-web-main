import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "./api";
import type { Fund } from "./useFundService";

export interface Product {
  id: string;
  name: string;
  type: string;
  description?: string;
  fund?: Fund;
}

export function useProductService() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const get = useCallback(async (id: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<Product[]>(`/product/v1/products?query=id==${id}`);
      let data: Product | null = null;
      if (result.length > 0) {
        data = { ...result[0] };
      }
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error loading product", e);
      setError(t("common:error.product.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const getRecommendedProducts = useCallback(async (suitability: string[]) => {
    try {
      setError("");
      setLoading(true);
      const suitabilityQuery = suitability
        .map((value) => `fund.suitability==${value}`)
        .join(",");
      const result = await api.get<Product[]>(`/product/v1/products?query=(${suitabilityQuery})`);
      const products = result.filter((p) => p.fund?.active);
      products.sort((p1, p2) => {
        const s1 = p1.fund?.suitability || 0;
        const s2 = p2.fund?.suitability || 0;
        return (s2 as number) - (s1 as number);
      });
      setLoading(false);
      return products;
    } catch (e) {
      console.error("Error loading recommended products", e);
      setError(t("common:error.fund.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  return { get, getRecommendedProducts, loading, error };
}

// Hook to load a single product by ID
export function useProduct(id: string | null): [Product | null, boolean, string] {
  const { t } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        setError("");
        setLoading(true);
        const result = await api.get<Product[]>(`/product/v1/products?query=id==${id}`);
        if (result.length > 0) {
          setProduct({ ...result[0] });
        } else {
          throw new Error("Product not found");
        }
      } catch (e) {
        console.error("Error loading product", e);
        setError(t("common:error.product.load"));
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, t]);

  return [product, loading, error];
}

export default useProductService;
