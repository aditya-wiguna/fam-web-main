import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, H2, H3, P, Button, Card, TopNav, Small, Skeleton, Link } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { AuthContext, ProfileContext } from "../contexts";
import { useProduct } from "../services";
import numeral from "numeral";

// Collapsible Panel component
function Panel({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-3 text-left"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <svg 
          className={`w-5 h-5 text-teal-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}

// Risk rating display
function RiskRatingBadge({ rating }: { rating: number }) {
  const { t } = useTranslation();
  
  let label = t("fundDetails:text.riskRating.low");
  let colorClass = "bg-green-100 text-green-800";
  
  if (rating > 6) {
    label = t("fundDetails:text.riskRating.high");
    colorClass = "bg-red-100 text-red-800";
  } else if (rating > 3) {
    label = t("fundDetails:text.riskRating.medium");
    colorClass = "bg-yellow-100 text-yellow-800";
  }
  
  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${colorClass}`}>
      {label} ({rating})
    </span>
  );
}

export default function FundDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { tier, portfolio, riskProfile } = useContext(ProfileContext);
  const [product, loading] = useProduct(id || null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError(t("common:error.fund.load"));
    }
  }, [id, t]);

  const downloadFactsheet = () => {
    if (product?.fund?.factsheetUrl) {
      window.open(product.fund.factsheetUrl, "_blank");
    }
  };

  const viewRiskProfile = () => {
    navigate("/risk-profile");
  };

  const completePersonalInfo = () => {
    navigate(`/signup/info?mode=subscribe&productId=${id}`);
  };

  const completeRiskProfile = () => {
    navigate(`/risk-assessment?mode=subscribe&productId=${id}`);
  };

  const subscribe = () => {
    navigate(`/subscribe?productId=${id}`);
  };

  const redeem = () => {
    navigate(`/redeem?productId=${id}`);
  };

  const invest = () => {
    if (!user) {
      navigate("/login");
    } else if (tier <= 1) {
      completePersonalInfo();
    } else if (!riskProfile) {
      completeRiskProfile();
    } else {
      subscribe();
    }
  };

  // Check if user has holdings in this fund
  const holding = portfolio?.find(
    (item) => item.productId === id && (item.units > 0 || item.classDetails?.some(c => c.noOfShares > 0))
  );

  // Build action buttons
  const actions: Array<{ title: string; onPress: () => void }> = [];
  if (product?.fund?.active) {
    actions.push({ title: t("common:button.subscribe"), onPress: invest });
    if (holding) {
      actions.unshift({ title: t("common:button.redeem"), onPress: redeem });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <HighlightHeader color="grey900">
          <TopNav inverse allowBack />
          <div className="px-5 pb-8">
            <Skeleton loading={true}>
              <div className="h-8 w-48 bg-gray-600 rounded mb-4" />
              <div className="h-24 bg-gray-600 rounded" />
            </Skeleton>
          </div>
        </HighlightHeader>
        <HighlightBody>
          <Skeleton loading={true}>
            <div className="h-64" />
          </Skeleton>
        </HighlightBody>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white p-5">
        <TopNav allowBack />
        <div className="text-center py-12">
          <P color="error">{error || t("common:error.fund.load")}</P>
          <Button onClick={() => navigate(-1)} className="mt-4">
            {t("common:button.back")}
          </Button>
        </div>
      </div>
    );
  }

  const fund = product.fund;
  const additionalInfo = fund?.additionalInfo;

  return (
    <div className="min-h-screen pb-24">
      {/* Header with fund summary */}
      <HighlightHeader color="grey900">
        <TopNav inverse allowBack />
        <div className="px-5 pb-8">
          <H1 color="white" className="mb-4">{product.name}</H1>
          
          {/* Fund metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Small color="grey400">{t("subscription:form.label.nav")}</Small>
              <P color="white" className="font-semibold text-lg">
                {fund?.currency || "SGD"} {numeral(fund?.nav || 0).format("0.0000")}
              </P>
            </div>
            <div>
              <Small color="grey400">{t("fundDetails:text.riskRating.fund")}</Small>
              <div className="mt-1">
                <RiskRatingBadge rating={fund?.riskRating || 0} />
              </div>
            </div>
          </div>
        </div>
      </HighlightHeader>

      <HighlightBody>
        {/* Fund Details Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <H2 className="text-gray-600 font-light">{t("fundDetails:heading.title")}</H2>
            {fund?.factsheetUrl && (
              <Link onClick={downloadFactsheet}>{t("fundDetails:link.download")}</Link>
            )}
          </div>

          <Card>
            <P className="text-gray-600 mb-4">{product.description}</P>
            
            {typeof additionalInfo?.characteristic === 'string' && additionalInfo.characteristic && (
              <Panel title={t("fundDetails:heading.characteristics")}>
                <P className="text-gray-600">{additionalInfo.characteristic}</P>
              </Panel>
            )}
            
            {typeof additionalInfo?.whatHappened === 'string' && additionalInfo.whatHappened && (
              <Panel title={t("fundDetails:heading.whatHappened")}>
                <P className="text-gray-600">{additionalInfo.whatHappened}</P>
              </Panel>
            )}
            
            {typeof additionalInfo?.whatWillHappen === 'string' && additionalInfo.whatWillHappen && (
              <Panel title={t("fundDetails:heading.whatWillHappen")}>
                <P className="text-gray-600">{additionalInfo.whatWillHappen}</P>
              </Panel>
            )}
          </Card>
        </div>

        {/* Case Studies Section */}
        {fund?.caseStudies && fund.caseStudies.length > 0 && (
          <div className="mb-6">
            <H2 className="text-gray-600 font-light mb-4">{t("fundDetails:heading.caseStudy")}</H2>
            <Card>
              <P className="text-gray-600 mb-4">{t("fundDetails:text.caseStudy")}</P>
              {fund.caseStudies.map((caseStudy: { id: string; title: string }, index: number) => (
                <Panel key={caseStudy.id} title={`${t("fundDetails:heading.caseStudy")} ${index + 1}`}>
                  <P className="text-gray-600">{caseStudy.title}</P>
                </Panel>
              ))}
            </Card>
          </div>
        )}

        {/* Suitability Section */}
        <div className="mb-6">
          <H2 className="text-gray-600 font-light mb-4">{t("fundDetails:heading.suitabilities")}</H2>
          <Card>
            <P className="text-gray-600 mb-4">{t("fundDetails:text.suitabilities")}</P>
            
            {riskProfile ? (
              <Panel title={t("fundDetails:heading.testMySuitability")} defaultOpen>
                <div className="flex items-center gap-2 mb-4">
                  <H3 className="text-teal-700">{t("fundDetails:text.riskRating.user")}:</H3>
                  <span className="font-semibold">{riskProfile.profile?.name}</span>
                </div>
                <Button compact outline onClick={viewRiskProfile}>
                  {t("fundDetails:button.viewRiskProfile")}
                </Button>
              </Panel>
            ) : (
              <Panel title={t("fundDetails:heading.testMySuitability")} defaultOpen>
                <P className="text-gray-600 mb-4">{t("fundDetails:text.startAssessment")}</P>
                <Button compact onClick={viewRiskProfile}>
                  {t("fundDetails:button.startAssessment")}
                </Button>
              </Panel>
            )}
            
            {typeof additionalInfo?.shouldIPurchase === 'string' && additionalInfo.shouldIPurchase && (
              <Panel title={t("fundDetails:heading.shouldIPurchase")}>
                <P className="text-gray-600">{additionalInfo.shouldIPurchase}</P>
              </Panel>
            )}
          </Card>
        </div>
      </HighlightBody>

      {/* Fixed action buttons at bottom */}
      {user && actions.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-5 pb-5">
          <div className="bg-teal-700 rounded-3xl">
            <div className="bg-white/50 rounded-3xl py-4 px-5 flex items-center justify-around gap-4">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onPress}
                  className="text-white font-semibold text-base flex-1 text-center"
                >
                  {action.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
