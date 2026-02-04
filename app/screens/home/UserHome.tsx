import { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { H1, H2, H4, P, TopNav, Skeleton } from "../../components";
import { HighlightHeader, HighlightBody } from "../../components/Highlight";
import { AuthContext, ProfileContext, UIContext } from "../../contexts";
import { useStrategies } from "../../services/useStrategies";
import { StrategyInfo } from "./StrategyInfo";
import { FundList } from "./FundList";
import { PortfolioInfo } from "./PortfolioInfo";
import { mask } from "../../utils/mask";
import { ProfileDataField } from "../../utils/ProfileDataField";
import colors from "../../theme/colors";

export function UserHome() {
  const { t } = useTranslation();
  const { strategies, loading } = useStrategies();
  const { updateAuthData } = useContext(AuthContext);
  const { profile, portfolio, portfolioSummary } = useContext(ProfileContext);
  const { uiState, setUiState } = useContext(UIContext);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(
    (uiState.homeSelectedStrategyId as string) || null
  );

  useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyId) {
      const id = strategies[0].id;
      setSelectedStrategyId(id);
      setUiState({ ...uiState, homeSelectedStrategyId: id });
    }
  }, [strategies, selectedStrategyId, uiState, setUiState]);

  const selectedStrategy = strategies.find(({ id }) => id === selectedStrategyId);
  
  // Get funds from selected strategy - matching mobile logic
  const funds = strategies
    .filter((strategy) => strategy.id === selectedStrategyId)
    .flatMap(({ products }) => products || [])
    .filter(({ type }) => type === "FUND")
    .filter(({ fund }) => fund?.active);

  const hasPortfolio = portfolio && portfolio.length > 0;
  const firstName = profile?.[ProfileDataField.NAME_FIRST] as string ||
    mask.maskEmail(profile?.[ProfileDataField.CONTACT_EMAIL] as string);

  const handleLogout = async () => {
    await updateAuthData(null);
  };

  return (
    <div className="min-h-screen">
      <HighlightHeader>
        <TopNav inverse showLogo showLogout onLogout={handleLogout} />
        
        {/* Headline section - matching mobile headlineContainer with marginBottom: 20 */}
        <div className="mb-5">
          <H1 color="white" className="text-[28px] mb-2">
            {t("home:heading.user.title", { firstName })}
          </H1>
          {hasPortfolio ? (
            <PortfolioInfo portfolioSummary={portfolioSummary} />
          ) : (
            <P color="white">{t("home:heading.user.subtitle")}</P>
          )}
        </div>

        {/* Strategies section title - matching mobile H2 style */}
        <H2 color="white" className="text-2xl leading-[30px] font-light mt-0 mb-0">
          {t("home:section.strategies.title")}
        </H2>
      </HighlightHeader>

      <HighlightBody color="whiteRGBA" className="min-h-[60vh] pb-[70px]">
        <Skeleton loading={loading}>
          {/* Strategy tabs - horizontal scroll matching mobile filterContainer */}
          <div className="h-[50px]">
            <div className="flex overflow-x-auto pb-2 justify-evenly items-start flex-1 mb-2">
              {strategies.map(({ id, title }) => (
                <div key={id} className="w-[150px] flex flex-col items-center">
                  <button
                    onClick={() => {
                      setSelectedStrategyId(id);
                      setUiState({ ...uiState, homeSelectedStrategyId: id });
                    }}
                    className="text-center"
                  >
                    <P
                      className={`text-xl leading-[22px] my-3 ${
                        selectedStrategyId === id
                          ? "font-semibold"
                          : "font-semibold"
                      }`}
                      color={selectedStrategyId === id ? "teal500" : "black"}
                    >
                      {title}
                    </P>
                  </button>
                  {selectedStrategyId === id && (
                    <div 
                      className="h-0.5 w-10"
                      style={{ 
                        borderBottomWidth: 2, 
                        borderBottomColor: colors.teal500,
                        backgroundColor: colors.teal500 
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected strategy info - matching mobile my5 (margin 25px) */}
          {selectedStrategy && (
            <div className="my-6">
              <StrategyInfo strategy={selectedStrategy} />
            </div>
          )}

          {/* Funds list - matching mobile mb3 (margin 15px) */}
          <div className="mb-4">
            <H4>{t("home:heading.funds")}</H4>
            <FundList funds={funds} />
          </div>
        </Skeleton>
      </HighlightBody>
    </div>
  );
}

export default UserHome;
