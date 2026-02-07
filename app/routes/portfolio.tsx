import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import numeral from "numeral";
import { H1, H2, P, Button, Card, TopNav, Small } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { AuthContext, ProfileContext } from "../contexts";
import { useAuth } from "../services";
import noPortfolioImage from "../assets/images/noPortfolio.png";

const Currencies = {
  Sgd: { id: "SGD", name: "SGD", symbol: "S$" },
  Usd: { id: "USD", name: "USD", symbol: "US$" },
};

const currencies = [Currencies.Sgd, Currencies.Usd];

export default function Portfolio() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { portfolio, portfolioSummary } = useContext(ProfileContext);
  const { signOut } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <HighlightHeader>
          <TopNav inverse showLogo />
          <H1 color="white" className="text-3xl mb-2">{t("portfolio:heading.title")}</H1>
        </HighlightHeader>
        <HighlightBody className="min-h-[60vh]">
          <div className="text-center py-12">
            <P color="grey500" className="my-4">Please login to view your portfolio</P>
            <Button onClick={() => navigate("/login")}>{t("login:button.login")}</Button>
          </div>
        </HighlightBody>
      </div>
    );
  }

  const hasPortfolio = portfolio && portfolio.length > 0;

  if (!hasPortfolio) {
    return (
      <div className="min-h-screen">
        <HighlightHeader>
          <TopNav inverse showLogo showLogout onLogout={handleLogout} />
          <H1 color="white" className="text-3xl mb-2">{t("portfolio:heading.title")}</H1>
        </HighlightHeader>
        <HighlightBody className="min-h-[60vh]">
          <Card className="text-center py-8 mt-8">
            <div className="flex justify-center mb-4">
              <img src={noPortfolioImage} alt="No portfolio" className="h-32 object-contain" />
            </div>
            <P color="grey600" className="mb-4 text-center">{t("portfolio:text.noPortfolio")}</P>
            <Button compact onClick={() => navigate("/")}>
              {t("portfolio:button.feature.products")}
            </Button>
          </Card>
        </HighlightBody>
      </div>
    );
  }

  const { totalAssetValue, totalDeposit, totalWithdrawal, profitLoss, profitLossPercentage } = portfolioSummary || {};
  const isPositive = (profitLoss || 0) >= 0;

  // Sort holdings by asset value
  const sortedPortfolio = [...portfolio].sort((h1, h2) => {
    const key = `totalNav${selectedCurrency.id}` as keyof typeof h1;
    const t1 = (h1[key] as number) || 0;
    const t2 = (h2[key] as number) || 0;
    return t2 - t1;
  });

  return (
    <div className="min-h-screen">
      <HighlightHeader>
        <TopNav inverse showLogo showLogout onLogout={handleLogout} />
        
        <div className="mb-4">
          <H1 color="white" className="text-3xl mb-2">{t("portfolio:heading.title")}</H1>
          
          {/* Currency selector */}
          <div className="flex gap-4 mb-4">
            {currencies.map((currency) => (
              <button
                key={currency.id}
                onClick={() => setSelectedCurrency(currency)}
                className={`text-sm px-2 py-1 ${
                  selectedCurrency.id === currency.id
                    ? "text-[#6699DD] border-b-2 border-[#6699DD]"
                    : "text-gray-400"
                }`}
              >
                {currency.name}
              </button>
            ))}
          </div>

          {/* Portfolio Summary */}
          <div className="mb-4">
            <Small color="grey400">{t("portfolio:heading.totalAccountValue")}</Small>
            <div className="text-4xl font-bold text-white tracking-wide my-2">
              {selectedCurrency.symbol}{numeral(totalAssetValue).format("0,0")}
            </div>
            {profitLoss !== undefined && (
              <P color={isPositive ? "success" : "error"}>
                {isPositive ? "+" : ""}{selectedCurrency.symbol}{numeral(Math.abs(profitLoss)).format("0,0.00")} ({numeral(profitLossPercentage).format("0.00")}%)
              </P>
            )}
          </div>

          <div className="flex gap-8">
            <div>
              <Small color="grey400">{t("portfolio:heading.totalDeposit")}</Small>
              <P color="white">{selectedCurrency.symbol}{numeral(totalDeposit).format("0,0.00")}</P>
            </div>
            <div>
              <Small color="grey400">{t("portfolio:heading.totalWithdrawal")}</Small>
              <P color="white">{selectedCurrency.symbol}{numeral(totalWithdrawal).format("0,0.00")}</P>
            </div>
          </div>
        </div>
      </HighlightHeader>

      <HighlightBody color="whiteRGBA" className="min-h-[50vh] pb-24">
        <H2 className="text-xl font-light mt-4 mb-4">
          {t("portfolio:heading.accountHolding")}
        </H2>

        {sortedPortfolio.map((holding) => {
          const valueKey = `totalNav${selectedCurrency.id}` as keyof typeof holding;
          const depositKey = `depositAmount${selectedCurrency.id}` as keyof typeof holding;
          const withdrawKey = `withdrawAmount${selectedCurrency.id}` as keyof typeof holding;
          
          const value = (holding[valueKey] as number) || 0;
          const initialValue = ((holding[depositKey] as number) || 0) - ((holding[withdrawKey] as number) || 0);
          
          if (initialValue <= 0) return null;
          
          const diff = value - initialValue;
          const isHoldingPositive = diff >= 0;

          return (
            <Card
              key={holding.productId}
              onClick={() => navigate(`/fund/${holding.productId}`)}
              className="mb-4"
            >
              <div className="border-b border-gray-100 pb-2 mb-3">
                <h4 className="font-light text-base">{holding.productName || holding.fundName}</h4>
              </div>
              <div className="flex justify-between flex-wrap gap-4">
                <div>
                  <Small color="grey500">{t("portfolio:holding.currentValue")}</Small>
                  <P className="text-lg font-semibold">
                    {selectedCurrency.symbol}{numeral(value).format("0,0")}
                  </P>
                </div>
                <div>
                  <Small color="grey500">{t("portfolio:holding.profitLoss")}</Small>
                  <P className={`text-lg font-semibold ${isHoldingPositive ? "text-green-600" : "text-red-500"}`}>
                    {selectedCurrency.symbol}{numeral(Math.abs(diff)).format("0,0.00")}
                  </P>
                </div>
              </div>
            </Card>
          );
        })}
      </HighlightBody>
    </div>
  );
}
