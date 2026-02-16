import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import numeral from "numeral";
import { H1, H2, H4, P, Button, Card, TopNav, Small, Tiny } from "../components";
import { HighlightHeader } from "../components/Highlight";
import { AuthContext, ProfileContext } from "../contexts";
import { useAuth } from "../services";
import noPortfolioImage from "../assets/images/noPortfolio.png";
import colors from "../theme/colors";

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
      <div>
        <HighlightHeader>
          <TopNav inverse showLogo />
          <H1 style={{ fontSize: 28, fontWeight: "800", color: colors.white, marginBottom: 0, letterSpacing: 1 }}>
            {t("portfolio:heading.title")}
          </H1>
        </HighlightHeader>
        <div style={{ marginLeft: 20, marginRight: 20, paddingBottom: 70 }}>
          <div className="text-center py-12">
            <P color="grey500" className="my-4">Please login to view your portfolio</P>
            <Button onClick={() => navigate("/login")}>{t("login:button.login")}</Button>
          </div>
        </div>
      </div>
    );
  }

  const hasPortfolio = portfolio && portfolio.length > 0;

  if (!hasPortfolio) {
    return (
      <div>
        <div style={{ paddingLeft: 20, paddingRight: 20 }}>
          <TopNav inverse showLogo showLogout onLogout={handleLogout} />
          <H1 style={{ fontSize: 28, color: colors.white, marginTop: 0, marginBottom: 5 }}>
            {t("portfolio:heading.title")}
          </H1>
        </div>
        <div style={{ marginLeft: 20, marginRight: 20, marginTop: 25 }}>
          <Card>
            <div style={{ textAlign: "center", marginTop: 15, marginBottom: 5 }}>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 10, marginBottom: 10 }}>
                <img src={noPortfolioImage} alt="No portfolio" style={{ height: 160, objectFit: "contain", marginBottom: 20 }} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <H4 style={{ textAlign: "center", fontWeight: "300", marginTop: 10 }}>
                {t("portfolio:text.noPortfolio")}
              </H4>
            </div>
            <div style={{ marginBottom: 10, textAlign: "center" }}>
              <Button compact onClick={() => navigate("/")}>
                {t("portfolio:button.feature.products")}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const totalDepositValue = (portfolioSummary as any)?.[`depositAmount${selectedCurrency.id}`] || 0;
  const totalWithdrawalValue = (portfolioSummary as any)?.[`withdrawAmount${selectedCurrency.id}`] || 0;
  const value = (portfolioSummary as any)?.[`totalNav${selectedCurrency.id}`] || 0;
  const initialValue = totalDepositValue - totalWithdrawalValue;
  const diff = value - initialValue;
  const diffSign = diff > 0 ? "+" : "";
  const diffBgColor = diff > 0 ? colors.green : diff < 0 ? colors.red500 : colors.grey100;
  const totalAccountText = `${selectedCurrency.symbol}${numeral(value).format("0,0")}`;
  const diffAccountText = `${diffSign}${selectedCurrency.symbol}${numeral(diff).format("0,0")}`;

  const totalDepositText = `${selectedCurrency.symbol}${numeral(totalDepositValue).format("0,0")}`;
  const totalWithdrawalText = `${selectedCurrency.symbol}${numeral(totalWithdrawalValue).format("0,0")}`;

  // Sort holdings by asset value
  const sortedPortfolio = [...portfolio].sort((h1, h2) => {
    const key = `totalNav${selectedCurrency.id}` as keyof typeof h1;
    const t1 = (h1[key] as number) || 0;
    const t2 = (h2[key] as number) || 0;
    return t2 - t1;
  });

  return (
    <div>
      <HighlightHeader color="grey900">
        <TopNav inverse showLogo showLogout onLogout={handleLogout} />

        {/* Currency selector — right aligned */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
          {currencies.map((currency, i) => {
            const isSelected = currency.id === selectedCurrency.id;
            return (
              <div key={currency.id} style={{ marginLeft: i > 0 ? 15 : 0, borderBottom: isSelected ? `2px solid ${colors.teal500}` : "2px solid transparent" }}>
                <button
                  onClick={() => setSelectedCurrency(currency)}
                  style={{ background: "none", border: "none", cursor: "pointer", paddingTop: 0, paddingLeft: 5, paddingRight: 5, color: colors.grey30, fontSize: 14, fontWeight: "600" }}
                >
                  {currency.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* Portfolio Summary */}
        <div>
          <Small color="grey30">{t("portfolio:heading.totalAccountValue")}</Small>
          <H1 style={{ fontSize: 26, fontWeight: "800", color: colors.white, marginBottom: 0, letterSpacing: 1 }}>
            {totalAccountText}
          </H1>
          {diff !== 0 && (
            <span style={{
              display: "inline-block",
              marginTop: 5,
              paddingTop: 2, paddingBottom: 2, paddingLeft: 5, paddingRight: 5,
              borderRadius: 4,
              backgroundColor: diffBgColor,
              fontSize: 12,
            }}>
              {diffAccountText}
            </span>
          )}
        </div>

        {/* Deposit / Withdrawal summary */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 20, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ minWidth: "40%", marginLeft: "4%", marginRight: "4%" }}>
            <Tiny style={{ color: colors.teal100, lineHeight: "12px", marginTop: 0 }}>
              {t("portfolio:heading.totalWithdrawal")}
            </Tiny>
            <H2 style={{ fontSize: 18, lineHeight: "30px", color: colors.white, marginTop: 0, marginBottom: 0 }}>
              {totalWithdrawalText}
            </H2>
          </div>
          <div style={{ width: 0.5, backgroundColor: colors.teal200 }} />
          <div style={{ minWidth: "40%", marginLeft: "4%", marginRight: "4%" }}>
            <Tiny style={{ color: colors.teal100, lineHeight: "12px", marginTop: 0 }}>
              {t("portfolio:heading.totalDeposit")}
            </Tiny>
            <H2 style={{ fontSize: 18, lineHeight: "30px", color: colors.white, marginTop: 0, marginBottom: 0 }}>
              {totalDepositText}
            </H2>
          </div>
        </div>
      </HighlightHeader>

      {/* Account Holdings */}
      <div style={{ marginLeft: 20, marginRight: 20, paddingBottom: 70 }}>
        <H2 style={{ fontSize: 24, lineHeight: "30px", fontWeight: "200", color: colors.white, marginTop: 30, marginBottom: 20 }}>
          {t("portfolio:heading.accountHolding")}
        </H2>
        <div style={{ marginBottom: 25 }}>
          {sortedPortfolio.map((holding) => {
            const valueKey = `totalNav${selectedCurrency.id}` as keyof typeof holding;
            const depositKey = `depositAmount${selectedCurrency.id}` as keyof typeof holding;
            const withdrawKey = `withdrawAmount${selectedCurrency.id}` as keyof typeof holding;
            const holdingValue = (holding[valueKey] as number) || 0;
            const holdingInitial = ((holding[depositKey] as number) || 0) - ((holding[withdrawKey] as number) || 0);
            if (holdingInitial <= 0) return null;
            const holdingDiff = holdingValue - holdingInitial;
            const holdingDiffColor = holdingDiff > 0 ? colors.green : holdingDiff < 0 ? colors.red500 : colors.grey900;

            return (
              <Card key={holding.productId} onClick={() => navigate(`/fund/${holding.productId}`)}>
                <div style={{ borderBottomWidth: 0, paddingBottom: 5 }}>
                  <span style={{ fontSize: 16, fontWeight: "300" }}>
                    {holding.productName || holding.fundName}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 5, marginBottom: 10, flexWrap: "wrap" }}>
                  <div>
                    <Tiny color="grey500">{t("portfolio:holding.currentValue")}</Tiny>
                    <span style={{ display: "block", fontSize: 18, fontWeight: "600", color: colors.black }}>
                      {selectedCurrency.symbol}{numeral(holdingValue).format("0,0")}
                    </span>
                  </div>
                  <div style={{ minWidth: "30%" }}>
                    <Tiny color="grey500">{t("portfolio:holding.profitLoss")}</Tiny>
                    <span style={{ display: "block", fontSize: 18, fontWeight: "600", color: holdingDiffColor }}>
                      {selectedCurrency.symbol}{numeral(Math.abs(holdingDiff)).format("0,0.00")}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}