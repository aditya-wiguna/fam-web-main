import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, H2, P, Button, TopNav, Card, FundPerformanceCard, Skeleton } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { ProfileContext } from "../contexts";
import { useProductService, type Product } from "../services/useProductService";

export default function RiskProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { riskProfile } = useContext(ProfileContext);
  const { getRecommendedProducts, loading: productsLoading } = useProductService();
  const [recommendedFunds, setRecommendedFunds] = useState<Product[]>([]);

  const mode = searchParams.get("mode") || "update";
  const productId = searchParams.get("productId");

  // Get suitability from risk profile
  const suitability = riskProfile?.profile?.riskRating || [];

  useEffect(() => {
    async function loadRecommendedFunds() {
      if (suitability.length > 0 && mode !== "subscribe") {
        try {
          const products = await getRecommendedProducts(suitability);
          setRecommendedFunds(products || []);
        } catch (e) {
          console.error("Error loading recommended funds", e);
        }
      }
    }
    loadRecommendedFunds();
  }, [suitability, getRecommendedProducts, mode]);

  const startAssessment = () => {
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (productId) params.set("productId", productId);
    navigate(`/risk-assessment?${params.toString()}`);
  };

  const selectProfile = () => {
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (productId) params.set("productId", productId);
    navigate(`/risk-profile/selection?${params.toString()}`);
  };

  const backToSubscription = () => {
    if (productId) {
      navigate(`/fund/${productId}`);
    } else {
      navigate("/profile");
    }
  };

  const back = () => {
    if (mode === "subscribe" && productId) {
      backToSubscription();
    } else {
      navigate("/profile");
    }
  };

  const goToFund = (id: string) => {
    navigate(`/fund/${id}`);
  };

  // Render rich text content (simplified - handles string or array)
  const renderRichText = (content: unknown): string => {
    if (typeof content === "string") {
      return content;
    }
    if (Array.isArray(content)) {
      return content.map((block: { text?: string }) => block.text || "").join(" ");
    }
    return "";
  };

  // If no risk profile, show assessment prompt
  if (!riskProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <HighlightHeader>
          <TopNav allowBack inverse onBack={back} />
          <div className="px-5 pb-8">
            <H1 color="white">{t("riskAssessment:heading.title")}</H1>
          </div>
        </HighlightHeader>

        <HighlightBody className="flex-1">
          <Card>
            <P className="mb-6">{t("riskAssessment:text.startAssessment")}</P>
            <Button onClick={startAssessment} className="w-full">
              {t("riskAssessment:button.startAssessment")}
            </Button>
          </Card>
        </HighlightBody>
      </div>
    );
  }

  const profileData = riskProfile.profile;
  const profileName = profileData?.name || t("riskAssessment:heading.title");
  const description = profileData?.description ? renderRichText(profileData.description) : "";
  const investmentObjective = profileData?.investmentObjective ? renderRichText(profileData.investmentObjective) : "";
  const riskTolerance = profileData?.riskTolerance ? renderRichText(profileData.riskTolerance) : "";

  return (
    <div className="min-h-screen flex flex-col">
      <HighlightHeader>
        <TopNav 
          allowBack 
          inverse 
          onBack={back}
          title={t("riskProfile:heading.title")}
        />
        <div className="px-5 pb-8">
          <H1 color="white">{profileName}</H1>
        </div>
      </HighlightHeader>

      <HighlightBody className="flex-1 pb-8">
        {description && (
          <Card className="mb-4">
            <P>{description}</P>
          </Card>
        )}

        <H2 className="mb-3">{t("riskProfile:text.investmentObjective")}</H2>
        <div className="border-b border-gray-200 mb-4" />
        <Card className="mb-6">
          <P>
            {investmentObjective || t("riskProfile:text.noData")}
          </P>
        </Card>

        <H2 className="mb-3">{t("riskProfile:text.riskTolerance")}</H2>
        <div className="border-b border-gray-200 mb-4" />
        <Card className="mb-6">
          <P>
            {riskTolerance || t("riskProfile:text.noData")}
          </P>
        </Card>

        <div className="space-y-3 mt-8">
          {mode === "subscribe" ? (
            <Button onClick={backToSubscription} className="w-full">
              {t("common:button.continue")}
            </Button>
          ) : (
            <>
              <Button onClick={selectProfile} className="w-full">
                {t("riskProfile:button.changePreference")}
              </Button>
              <Button outline onClick={startAssessment} className="w-full">
                {t("riskProfile:button.redoAssessment")}
              </Button>
            </>
          )}
        </div>

        {/* Recommended Funds Section */}
        {mode !== "subscribe" && (
          <div className="mt-10">
            <H2 className="mb-3">{t("riskProfile:text.recommendedFunds")}</H2>
            <div className="border-b border-gray-200 mb-4" />
            
            {productsLoading && (
              <Skeleton loading={true}>
                <div className="h-32" />
              </Skeleton>
            )}

            {!productsLoading && recommendedFunds.length > 0 && (
              <div className="space-y-4">
                {recommendedFunds.map((product) => (
                  <FundPerformanceCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    fund={product.fund}
                    showRiskRating={true}
                    onClick={() => goToFund(product.id)}
                  />
                ))}
              </div>
            )}

            {!productsLoading && recommendedFunds.length === 0 && (
              <P className="text-gray-500">{t("riskProfile:text.noFundMatches")}</P>
            )}
          </div>
        )}
      </HighlightBody>
    </div>
  );
}
