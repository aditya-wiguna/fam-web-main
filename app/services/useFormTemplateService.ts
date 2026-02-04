import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "./api";

export interface FormTemplate {
  id: string;
  key: string;
  status: string;
  form: {
    introduction?: unknown;
    questions?: Array<{
      id: string;
      question: string;
      outputReferenceId?: string;
      options?: Array<{ id: string; text: string; score: number }>;
      answerConfig?: {
        options?: Array<{
          config: {
            value: string;
            label: string;
          };
        }>;
      };
    }>;
    riskProfiles?: Array<{
      id: string;
      name: string;
      description: string;
      riskRating: string[];
      scoreAssignment: { min: number; max: number };
      assetAllocation?: { equities: number; bonds: number };
      investmentObjective?: string;
      riskTolerance?: string;
      suitability?: number[];
    }>;
  };
}

export const FormTemplateKey = {
  AssessmentForm: "ASSESSMENT_FORM_TEST_3",
  DeclarationForm: "CLIENT_DECLARATION_TEST_1",
  ClientDeclarationPersonalInfoForm: "CLIENT_DECLARATION_PERSONAL_INFO_TEST_1",
};

export function useFormTemplateService() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getLatestPublished = useCallback(async (templateKey: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<FormTemplate>(`/common/v1/form-templates/latest?key=${templateKey}&status=PUBLISHED`);
      setLoading(false);
      return { ...result };
    } catch (e) {
      console.error("Error loading form template", e);
      setError(t("common:error.form.template.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  const get = useCallback(async (id: string) => {
    try {
      setError("");
      setLoading(true);
      const result = await api.get<FormTemplate>(`/common/v1/form-templates/${id}`);
      setLoading(false);
      return { ...result };
    } catch (e) {
      console.error("Error loading form template", e);
      setError(t("common:error.form.template.load"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  return { getLatestPublished, get, loading, error };
}

export default useFormTemplateService;
