import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Card, Tiny } from "./index";
import numeral from "numeral";
import colors from "../theme/colors";

interface FundPerformanceCardProps {
  id: string;
  name: string;
  description?: string;
  fund?: {
    id?: string;
    suitability?: number;
    riskRating?: number;
    performanceYTD?: number;
    performanceSinceInception?: number;
  };
  showRiskRating?: boolean;
  onClick?: () => void;
}

export function FundPerformanceCard({
  id,
  name,
  description,
  fund,
  showRiskRating = false,
  onClick,
}: FundPerformanceCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/fund/${id}`);
    }
  };

  const getPerformanceStyle = (value: number) => {
    if (value > 0) return { color: colors.green };
    if (value < 0) return { color: colors.red500 };
    return { color: colors.grey900 };
  };

  const formatPerformance = (value: number = 0, showColor: boolean = false) => {
    const formatted = numeral(value).format(value === 0 ? "0%" : "0.00%");
    const style = showColor ? getPerformanceStyle(value) : { color: colors.black };
    
    return (
      <span 
        className="text-[22px] font-semibold"
        style={style}
      >
        {formatted}
      </span>
    );
  };

  const riskRatingValue = fund?.suitability || fund?.riskRating;

  return (
    <Card 
      onClick={handleClick}
      className="cursor-pointer border-gray-200 p-4 mb-4"
    >
      {/* Fund title section - matching mobile cardTitle */}
      <div className="border-b-0 border-gray-200 pb-2">
        <h3 
          className="text-base font-light pb-0 mt-1 mb-1"
          style={{ color: colors.black }}
        >
          {name}
        </h3>
        
        {showRiskRating && riskRatingValue && (
          <div className="mt-2 mb-1">
            <span style={{ color: colors.teal700 }}>
              {t("riskProfile:text.RiskRating")}:{" "}
              <span>{riskRatingValue}</span>
            </span>
          </div>
        )}
        
        {description && (
          <Tiny color="grey500">{description}</Tiny>
        )}
      </div>

      {/* Performance metrics - matching mobile cardContainer */}
      <div className="flex justify-between mt-1 mb-1 flex-wrap">
        <div>
          <Tiny color="grey500">{t("riskProfile:text.YTD")}</Tiny>
          <div>{formatPerformance(fund?.performanceYTD, false)}</div>
        </div>
        <div className="min-w-[50%]">
          <Tiny color="grey500">{t("riskProfile:text.sinceInception")}</Tiny>
          <div>{formatPerformance(fund?.performanceSinceInception, true)}</div>
        </div>
      </div>
    </Card>
  );
}

export default FundPerformanceCard;
