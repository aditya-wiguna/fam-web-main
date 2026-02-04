import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, H2, P, Button, TopNav, Card, FundPerformanceCard, Skeleton } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { ProfileContext, type RiskProfileItem } from "../contexts";
import { useProductService, type Product } from "../services/useProductService";
import { useRiskProfileService } from "../services/useRiskProfileService";

export default function RiskProfileSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, riskProfile, updateRiskProfileData } = useContext(ProfileContext);
  const { getRecommendedProducts, loading: productsLoading } = useProductService();
  const { save, loading } = useRiskProfileService();
  
  const [selectedProfile, setSelectedProfile] = useState<RiskProfileItem | null>(null);
  const [recommendedFunds, setRecommendedFunds] = useState<Product[]>([]);

  const mode = searchParams.get("mode") || "update";
  const productId = searchParams.get("productId");

  // Initialize selected profile from current risk profile
  useEffect(() => {
    if (riskProfile?.profile) {
      setSelectedProfile(riskProfile.profile);
    }
  }, [riskProfile]);

  // Load recommended funds when selected profile changes
  useEffect(() => {
    async function loadRecommendedFunds() {
      const suitability = selectedProfile?.riskRating || [];
      if (suitability.length > 0) {
        try {
          const products = await getRecommendedProducts(suitability);
          setRecommendedFunds(products || []);
        } catch (e) {
          console.error("Error loading recommended funds", e);
        }
      }
    }
    loadRecommendedFunds();
  }, [selectedProfile, getRecommendedProducts]);

  const startAssessment = () => {
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (productId) params.set("productId", productId);
    navigate(`/risk-assessment?${params.toString()}`);
  };

  const setPreference = async () => {
    if (!profile?.id || !selectedProfile || !riskProfile?.templateId) return;

    try {
      const riskProfileData = {
        riskAnswer: {},
        riskAssessmentDate: new Date().toISOString(),
        riskScore: selectedProfile.scoreAssignment?.min || 0,
        templateId: riskProfile.templateId,
      };
      const updatedRiskProfile = await save(profile.id, riskProfileData);
      await updateRiskProfileData(updatedRiskProfile);

      const params = new URLSearchParams();
      if (mode) params.set("mode", mode);
      if (productId) params.set("productId", productId);
      navigate(`/risk-profile?${params.toString()}`);
    } catch (e) {
      console.error("Error saving risk profile", e);
    }
  };

  const back = () => {
    navigate(-1);
  };

  const goToFund = (id: string) => {
    navigate(`/fund/${id}`);
  };

  // Render rich text content
  const renderRichText = (content: unknown): string => {
    if (typeof content === "string") {
      return content;
    }
    if (Array.isArray(content)) {
      return content.map((block: { text?: string }) => block.text || "").join(" ");
    }
    return "";
  };

  // If no risk profile, redirect to assessment
  if (!riskProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <HighlightHeader>
          <TopNav allowBack inverse onBack={back} />
          <div className="px-5 pb-8">
            <H1 color="white">{t("riskProfile:heading.title.selection")}</H1>
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

  const profiles = riskProfile.profiles || [];
  const description = selectedProfile?.description ? renderRichText(selectedProfile.description) : "";
  const investmentObjective = selectedProfile?.investmentObjective ? renderRichText(selectedProfile.investmentObjective) : "";
  const riskTolerance = selectedProfile?.riskTolerance ? renderRichText(selectedProfile.riskTolerance) : "";

  return (
    <div className="min-h-screen flex flex-col">
      <HighlightHeader>
        <TopNav 
          allowBack 
          inverse 
          onBack={back}
          title={t("riskProfile:heading.title")}
        />
        
        {/* Profile selector tabs */}
        {!loading && profiles.length > 0 && (
          <div className="flex justify-around mb-4 px-4">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProfile(p)}
                className="flex flex-col items-center px-2"
              >
                <P 
                  color="white"
                  className={selectedProfile?.id === p.id ? "font-semibold" : ""}
                >
                  {p.name}
                </P>
                <div 
                  className={`w-12 h-0.5 mt-1 ${
                    selectedProfile?.id === p.id ? "bg-teal-500" : "bg-transparent"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        <div className="px-5 pb-8">
          <H1 color="white">{selectedProfile?.name || ""}</H1>
        </div>
      </HighlightHeader>

      <HighlightBody className="flex-1 pb-8">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          </div>
        )}

        {!loading && selectedProfile && (
          <>
            {description && (
              <Card className="mb-4">
                <P>{description}</P>
              </Card>
            )}

            <H2 className="mb-3">{t("riskProfile:text.investmentObjective")}</H2>
            <div className="border-b border-gray-200 mb-4" />
            <Card className="mb-6">
              <P>{investmentObjective || t("riskProfile:text.noData")}</P>
            </Card>

            <H2 className="mb-3">{t("riskProfile:text.riskTolerance")}</H2>
            <div className="border-b border-gray-200 mb-4" />
            <Card className="mb-6">
              <P>{riskTolerance || t("riskProfile:text.noData")}</P>
            </Card>

            <div className="space-y-3 mt-6">
              <Button onClick={setPreference} className="w-full">
                {t("riskProfile:button.setPreference")}
              </Button>
              <Button outline onClick={startAssessment} className="w-full">
                {t("riskProfile:button.redoAssessment")}
              </Button>
            </div>

            {/* Recommended Funds Section */}
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
          </>
        )}
      </HighlightBody>
    </div>
  );
}
