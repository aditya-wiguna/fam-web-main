import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button, H1, H2, P, TopNav, Skeleton } from "../../components";
import { HighlightHeader, HighlightBody } from "../../components/Highlight";
import { useStrategies } from "../../services/useStrategies";
import { useState, useEffect } from "react";
import { StrategyInfo } from "./StrategyInfo";
import colors from "../../theme/colors";

export function VisitorHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { strategies, loading } = useStrategies();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);

  useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0].id);
    }
  }, [strategies, selectedStrategyId]);

  const selectedStrategy = strategies.find(({ id }) => id === selectedStrategyId);

  return (
    <div className="min-h-screen">
      <HighlightHeader>
        <TopNav inverse showLogo />
        
        {/* Headline section - matching mobile headlineContainer with marginBottom: 20 */}
        <div className="mb-5">
          <H1 color="white" className="text-[28px] mb-2">
            {t("home:heading.visitor.title")}
          </H1>
          <P color="white">{t("home:heading.visitor.subtitle")}</P>
        </div>

        {/* Action buttons - matching mobile buttonContainer with marginBottom: 30 */}
        <div className="flex gap-3 mb-8">
          <Button 
            onClick={() => navigate("/signup")} 
            darkBackground 
            compact
            className="min-w-[130px]"
          >
            {t("home:button.signup")}
          </Button>
          <Button 
            onClick={() => navigate("/login")} 
            outline 
            darkBackground 
            compact
            className="min-w-[130px]"
            style={{ borderColor: colors.teal500 }}
          >
            {t("home:button.login")}
          </Button>
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
                    onClick={() => setSelectedStrategyId(id)}
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

          {/* Selected strategy info - matching mobile my3 (margin 15px) */}
          {selectedStrategy && (
            <div className="my-4">
              <StrategyInfo strategy={selectedStrategy} peek />
            </div>
          )}

          {/* Login link - matching mobile helpLinkContainer */}
          <div className="mx-4 my-4 flex items-center justify-center text-center">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1"
              style={{ color: colors.teal700 }}
            >
              <span className="border-b border-transparent pr-1">
                {t("home:text.visitor.login1")}
              </span>
              <span 
                className="border-b"
                style={{ borderBottomColor: colors.teal700 }}
              >
                {t("home:text.visitor.login2")}
              </span>
              <span className="border-b border-transparent pl-1">
                {t("home:text.visitor.login3")}
              </span>
            </button>
          </div>
        </Skeleton>
      </HighlightBody>
    </div>
  );
}

export default VisitorHome;
