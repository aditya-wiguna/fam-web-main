import { H2, P } from "../../components";

interface Strategy {
  id: string;
  title: string;
  description?: string;
  icon?: {
    url?: string;
  };
  products?: Array<{
    id: string;
    type: string;
    fund?: { id: string; name: string; active: boolean };
  }>;
}

interface StrategyInfoProps {
  strategy: Strategy;
  peek?: boolean;
}

export function StrategyInfo({ strategy, peek = false }: StrategyInfoProps) {
  if (!strategy) {
    return null;
  }

  const { title, description, icon } = strategy;

  return (
    <>
      {/* Strategy header with icon and title - matching mobile container */}
      <div className="flex flex-row">
        {icon?.url && (
          <div>
            <img 
              src={icon.url} 
              alt={title}
              className="w-12 h-12 mt-0 ml-0 mr-4 object-contain"
            />
          </div>
        )}
        <div className="mt-1">
          <H2 className="mt-1 mb-1">{title}</H2>
        </div>
      </div>
      
      {/* Description with optional fade effect for peek mode - matching mobile summary */}
      <div className="mt-2">
        {peek ? (
          <div className="relative">
            <P color="black">{description}</P>
            {/* Fading gradient overlay for peek mode */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, transparent, rgba(252, 255, 253, 0.9))"
              }}
            />
          </div>
        ) : (
          <P color="black">{description}</P>
        )}
      </div>
    </>
  );
}

export default StrategyInfo;
