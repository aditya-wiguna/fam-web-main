import { P } from "../../components";
import { FundPerformanceCard } from "../../components/FundPerformanceCard";

interface FundProduct {
  id: string;
  name?: string;
  description?: string;
  type: string;
  fund?: {
    id: string;
    name: string;
    active: boolean;
    currency?: string;
    nav?: number;
    riskRating?: number;
    suitability?: number;
    performanceYTD?: number;
    performanceSinceInception?: number;
  };
}

interface FundListProps {
  funds: FundProduct[];
}

export function FundList({ funds }: FundListProps) {
  if (funds.length === 0) {
    return <P color="grey500">No funds available</P>;
  }

  // Sort funds by YTD performance (descending) - matching mobile behavior
  const sortedFunds = [...funds].sort((f1, f2) => {
    const perf1 = f1.fund?.performanceYTD || 0;
    const perf2 = f2.fund?.performanceYTD || 0;
    return perf2 - perf1;
  });

  return (
    <div className="mt-3">
      {sortedFunds.map((product) => {
        const fund = product.fund;
        if (!fund) return null;

        return (
          <FundPerformanceCard
            key={product.id}
            id={product.id}
            name={fund.name || product.name || ""}
            description={product.description}
            fund={{
              id: fund.id,
              suitability: fund.suitability,
              performanceYTD: fund.performanceYTD,
              performanceSinceInception: fund.performanceSinceInception,
            }}
          />
        );
      })}
    </div>
  );
}

export default FundList;
