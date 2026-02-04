import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  H1,
  P,
  TopNav,
  Skeleton,
} from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { useFormTemplateService, FormTemplateKey, type FormTemplate } from "../services";

interface IntroBlock {
  text?: string;
  type?: string;
  children?: Array<{ text?: string }>;
}

export default function RiskAssessment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getLatestPublished, loading, error } = useFormTemplateService();
  const [template, setTemplate] = useState<FormTemplate | null>(null);

  const mode = searchParams.get("mode") || "update";
  const productId = searchParams.get("productId");

  useEffect(() => {
    async function loadTemplate() {
      try {
        const result = await getLatestPublished(FormTemplateKey.AssessmentForm);
        setTemplate(result);
      } catch (e) {
        console.error("Error loading assessment template", e);
      }
    }
    loadTemplate();
  }, [getLatestPublished]);

  const goToForm = () => {
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (productId) params.set("productId", productId);
    navigate(`/risk-assessment/form?${params.toString()}`);
  };

  const back = () => {
    navigate(-1);
  };

  // Render rich text content (simplified - handles string or array)
  const renderRichText = (content: unknown): string => {
    if (typeof content === "string") {
      return content;
    }
    if (Array.isArray(content)) {
      return content.map((block: IntroBlock) => {
        if (block.text) return block.text;
        if (block.children) {
          return block.children.map((child) => child.text || "").join("");
        }
        return "";
      }).join("\n\n");
    }
    return "";
  };

  const renderIntroduction = () => {
    if (!template?.form?.introduction) {
      return (
        <P className="mb-6">
          {t("riskAssessment:text.startAssessment")}
        </P>
      );
    }

    const introText = renderRichText(template.form.introduction);
    
    if (!introText) {
      return (
        <P className="mb-6">
          {t("riskAssessment:text.startAssessment")}
        </P>
      );
    }

    return (
      <div className="mb-6 space-y-4">
        {introText.split("\n\n").map((paragraph, index) => (
          <P key={index}>{paragraph}</P>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HighlightHeader>
        <TopNav allowBack inverse onBack={back} />
        <div className="pb-8">
          <H1 color="white">{t("riskAssessment:heading.title")}</H1>
        </div>
      </HighlightHeader>

      <HighlightBody className="flex-1">
        {error && <Alert className="mb-4">{error}</Alert>}

        {loading ? (
          <Skeleton loading={true}>
            <div className="h-48" />
          </Skeleton>
        ) : (
          <div className="mt-4">
            {renderIntroduction()}
            
            <div className="space-y-3 mt-6">
              <Button onClick={goToForm} className="w-full">
                {t("common:button.start")}
              </Button>
              <Button outline onClick={back} className="w-full">
                {t("common:button.back")}
              </Button>
            </div>
          </div>
        )}
      </HighlightBody>
    </div>
  );
}
