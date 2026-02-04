import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { H2, P, Tiny } from "../../components";
import type { PortfolioSummary } from "../../contexts";
import numeral from "numeral";
import { IoEye, IoEyeOff } from "react-icons/io5";

interface PortfolioInfoProps {
  portfolioSummary: PortfolioSummary | null;
}

export function PortfolioInfo({ portfolioSummary }: PortfolioInfoProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [maskAmount, setMaskAmount] = useState(true);

  if (!portfolioSummary) return null;

  const { totalAssetValue, totalDeposit, totalWithdrawal } = portfolioSummary;
  const netDeposit = (totalDeposit || 0) - (totalWithdrawal || 0);

  return (
    <div>
      {/* Title with eye toggle - matching mobile layout */}
      <div className="flex items-center gap-0 mb-2">
        <H2 color="white" className="text-lg font-light my-2">
          {t("home:heading.user.portfolio")}
        </H2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMaskAmount(!maskAmount);
          }}
          className="flex items-center pl-4 pr-1 py-1"
        >
          {maskAmount ? (
            <IoEyeOff size={24} className="text-white" />
          ) : (
            <IoEye size={24} className="text-white" />
          )}
        </button>
      </div>

      {/* Portfolio card - matching mobile styling */}
      <div 
        className="rounded-2xl border border-[#279d99] p-4 flex flex-wrap min-h-[125px] cursor-pointer"
        style={{ backgroundColor: "rgba(39, 157, 153, 0.5)" }}
        onClick={() => navigate("/portfolio")}
      >
        {/* Net Deposit */}
        <div className="flex-grow my-2 mx-4 min-w-[35%]">
          <Tiny color="grey10" className="block mb-0">
            {t("home:text.portfolio.netDeposit")}
          </Tiny>
          <H2 color="white" className="text-base font-semibold my-1 min-h-[30px]">
            {maskAmount ? (
              <span className="text-[50px] leading-5 tracking-widest">......</span>
            ) : (
              <>S${numeral(netDeposit).format("0,0")}</>
            )}
          </H2>
        </div>

        {/* Total Asset */}
        <div className="flex-grow my-2 mx-4 min-w-[35%]">
          <Tiny color="grey10" className="block mb-0">
            {t("home:text.portfolio.totalAsset")}
          </Tiny>
          <H2 color="white" className="text-base font-semibold my-1 min-h-[30px]">
            {maskAmount ? (
              <span className="text-[50px] leading-5 tracking-widest">......</span>
            ) : (
              <>S${numeral(totalAssetValue).format("0,0")}</>
            )}
          </H2>
          <div className="text-right mt-2">
            <P color="white" className="text-sm">
              {t("home:text.portfolio.viewAll")}
            </P>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioInfo;
