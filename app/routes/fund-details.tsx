import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, H2, H4, P, Button, TopNav, Skeleton, Link } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import FundChart from "../components/FundChart";
import { AuthContext, ProfileContext } from "../contexts";
import { useProduct } from "../services";
import colors from "../theme/colors";

// Collapsible Panel matching mobile Panel component structure
// Mobile Panel props: backgroundColor, borderColor, shadowColor, headerDivider,
// paddingTop/Bottom/Left/Right, iconColor, initialExpanded, Header, Summary, children
function Panel({ 
  title,
  headerContent,
  children, 
  defaultOpen = false,
  transparent = false,
  iconColor = colors.black,
}: { 
  title?: string;
  headerContent?: React.ReactNode;
  children?: React.ReactNode; 
  defaultOpen?: boolean;
  transparent?: boolean;
  iconColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Mobile: transparent panels use backgroundColor="transparent", shadowColor="transparent",
  // headerDivider="transparent", padding all 0
  // Default panels: white bg, grey200 shadow, grey200 headerDivider, padding 15
  const containerStyle: React.CSSProperties = transparent
    ? {
        backgroundColor: "transparent",
        padding: 0,
        marginTop: 0,
        marginBottom: 15,
      }
    : {
        backgroundColor: colors.white,
        borderColor: "transparent",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 16,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 0,
        marginBottom: 15,
        boxShadow: `1px 2px 2px rgba(0,0,0,0.08)`,
      };

  // Mobile: headerDivider controls body borderTopColor
  // transparent panels have headerDivider="transparent" so no visible divider
  const headerDivider = transparent ? "transparent" : colors.grey200;

  return (
    <div style={containerStyle}>
      {/* Header row: head (83%) + toggle arrow */}
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <div
          style={{ flexGrow: 1, width: "83%", cursor: "pointer" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {headerContent || (
            <span style={{ fontWeight: "600", fontSize: 18, lineHeight: "20px", color: colors.black }}>
              {title}
            </span>
          )}
        </div>
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ 
              paddingLeft: 25,
              paddingRight: 25,
              paddingTop: 4,
              paddingBottom: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.2s",
            }}
          >
            <svg
              width="24" height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: iconColor }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
      {/* Body: shown when expanded */}
      {isOpen && children && (
        <div style={{ 
          width: "100%",
          marginTop: 5, 
          borderTopWidth: 0.5, 
          borderTopStyle: "solid",
          borderTopColor: headerDivider,
        }}>
          {children}
        </div>
      )}
    </div>
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

  const holding = portfolio?.find(
    (item) => item.productId === id && (item.units > 0 || item.classDetails?.some(c => c.noOfShares > 0))
  );

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
          <div style={{ padding: "0 20px 32px", minHeight: 337 }}>
            <Skeleton loading={true}>
              <div className="h-8 w-48 rounded mb-4" style={{ backgroundColor: colors.grey600 }} />
              <div className="h-24 rounded" style={{ backgroundColor: colors.grey600 }} />
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
  const characteristicBlock = additionalInfo?.characteristic || null;
  const whatHappenedBlock = additionalInfo?.whatHappened || null;
  const whatWillHappenBlock = additionalInfo?.whatWillHappen || null;
  const shouldIPurchaseBlock = additionalInfo?.shouldIPurchase || null;

  // Render rich text content — handles both plain strings and DraftJS objects
  const renderContent = (value: unknown): React.ReactNode => {
    if (!value) return null;
    if (typeof value === "string") return <P>{value}</P>;
    // DraftJS format: { blocks: [{ text, type }], entityMap: {} }
    if (typeof value === "object" && value !== null && "blocks" in value) {
      const blocks = (value as { blocks: Array<{ text: string; type: string }> }).blocks;
      return (
        <>
          {blocks.map((block, i) => (
            <P key={i}>{block.text || "\u00A0"}</P>
          ))}
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen" style={{ paddingBottom: 96 }}>
      {/* Header */}
      <HighlightHeader color="grey900">
        <TopNav inverse allowBack />
        <div style={{ padding: "0 20px 32px", minHeight: 337 }}>
          <div style={{ marginBottom: 20 }}>
            <H1 className="text-white" style={{ fontSize: 20, fontWeight: "600", lineHeight: "23px", marginTop: 15, marginBottom: 0 }}>
              {product.name}
            </H1>
          </div>

          {/* Fund performance chart */}
          {fund?.id && (
            <div style={{ marginTop: 16 }}>
              <FundChart fundId={fund.id} baseCurrency={fund.currency || "SGD"} />
            </div>
          )}
        </div>
      </HighlightHeader>

      {/* Body */}
      <HighlightBody>
        <div style={{ marginTop: 20 }}>
          {/* Fund Details */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <H2 style={{ fontSize: 24, lineHeight: "30px", fontWeight: "200", color: colors.grey600, marginTop: 10, marginBottom: 10 }}>
                {t("fundDetails:heading.title")}
              </H2>
              {fund?.factsheetUrl && (
                <div style={{ textAlign: "right", marginTop: 12 }}>
                  <Link onClick={downloadFactsheet}>{t("fundDetails:link.download")}</Link>
                </div>
              )}
            </div>

            <Panel
              headerContent={
                <P style={{ color: colors.grey600, marginTop: 0, marginBottom: 20 }}>{product.description}</P>
              }
              defaultOpen={false}
              transparent
              iconColor={colors.teal}
            >
              {characteristicBlock && (
                <Panel title={t("fundDetails:heading.characteristics")} defaultOpen={false}>
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    {renderContent(characteristicBlock)}
                  </div>
                </Panel>
              )}
              {whatHappenedBlock && (
                <Panel title={t("fundDetails:heading.whatHappened")} defaultOpen={false}>
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    {renderContent(whatHappenedBlock)}
                  </div>
                </Panel>
              )}
              {whatWillHappenBlock && (
                <Panel title={t("fundDetails:heading.whatWillHappen")} defaultOpen={false}>
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    {renderContent(whatWillHappenBlock)}
                  </div>
                </Panel>
              )}
            </Panel>
          </div>

          {/* Case Studies */}
          {fund?.caseStudies && fund.caseStudies.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 20 }}>
                <H2 style={{ fontSize: 24, lineHeight: "30px", fontWeight: "200", color: colors.grey600, marginTop: 10, marginBottom: 10 }}>
                  {t("fundDetails:heading.caseStudy")}
                </H2>
              </div>
              <Panel
                headerContent={
                  <P style={{ color: colors.grey600, marginTop: 0, marginBottom: 20 }}>{t("fundDetails:text.caseStudy")}</P>
                }
                defaultOpen={false}
                transparent
                iconColor={colors.teal}
              >
                {fund.caseStudies.map((caseStudy: { id: string; title: string }, index: number) => (
                  <Panel key={caseStudy.id} title={`${t("fundDetails:heading.caseStudy")} ${index + 1}`} defaultOpen={false}>
                    <div style={{ marginTop: 15, color: colors.grey900 }}>
                      <P>{caseStudy.title}</P>
                    </div>
                  </Panel>
                ))}
              </Panel>
            </div>
          )}

          {/* Suitability */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <H2 style={{ fontSize: 24, lineHeight: "30px", fontWeight: "200", color: colors.grey600, marginTop: 10, marginBottom: 10 }}>
                {t("fundDetails:heading.suitabilities")}
              </H2>
            </div>
            <Panel
              headerContent={
                <P style={{ color: colors.grey600, marginTop: 0, marginBottom: 20 }}>{t("fundDetails:text.suitabilities")}</P>
              }
              defaultOpen={false}
              transparent
              iconColor={colors.teal}
            >
              {riskProfile ? (
                <Panel title={t("fundDetails:heading.testMySuitability")} defaultOpen={true}>
                  <div style={{ marginTop: 15, marginBottom: 15 }}>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <H4>
                        <span style={{ color: colors.teal700 }}>
                          {t("fundDetails:text.riskRating.user")}:{"\u00A0\u00A0"}
                        </span>
                      </H4>
                      <H4>
                        <span className="font-semibold">{riskProfile.profile?.name}</span>
                      </H4>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <Button compact outline onClick={viewRiskProfile}>
                      {t("fundDetails:button.viewRiskProfile")}
                    </Button>
                  </div>
                </Panel>
              ) : (
                <Panel title={t("fundDetails:heading.testMySuitability")} defaultOpen={true}>
                  <div style={{ marginTop: 15, marginBottom: 15 }}>
                    <P>{t("fundDetails:text.startAssessment")}</P>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <Button compact onClick={viewRiskProfile}>
                      {t("fundDetails:button.startAssessment")}
                    </Button>
                  </div>
                </Panel>
              )}
              {shouldIPurchaseBlock && (
                <Panel title={t("fundDetails:heading.shouldIPurchase")} defaultOpen={false}>
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    {renderContent(shouldIPurchaseBlock)}
                  </div>
                </Panel>
              )}
            </Panel>
          </div>
        </div>
      </HighlightBody>

      {/* Action buttons */}
      {user && actions.length > 0 && (
        <div style={{ position: "fixed", bottom: 50, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 512, paddingLeft: 20, paddingRight: 20 }}>
          <div style={{ backgroundColor: colors.teal700, borderRadius: 24 }}>
            <div style={{
              backgroundColor: colors.whiteRGBA50,
              borderRadius: 24,
              paddingTop: 18,
              paddingBottom: 18,
              paddingLeft: 20,
              paddingRight: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              flexDirection: "row",
            }}>
              {actions.map((action, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <div style={{ width: 1, height: 36, marginTop: -10, marginBottom: -10, backgroundColor: colors.white }} />
                  )}
                  <button
                    onClick={action.onPress}
                    style={{ fontWeight: "600", fontSize: 16, lineHeight: "20px", color: colors.grey50, flex: 1, textAlign: "center", background: "none", border: "none", cursor: "pointer" }}
                  >
                    {action.title}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}