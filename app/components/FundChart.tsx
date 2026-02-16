import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import numeral from "numeral";
import { useFundService } from "../services/useFundService";
import colors from "../theme/colors";

const CHART_HEIGHT = 150;
const MAX_DATA_POINTS = 50;
const MAX_LABELS = 3;

interface PerformanceType {
  value: string;
  label: string;
}

function sampleData<T>(data: T[]): T[] {
  if (!data || data.length === 0) return data;
  if (data.length > MAX_DATA_POINTS) {
    const k = Math.ceil(data.length / MAX_DATA_POINTS);
    return data.filter((_, i) => i % k === 0);
  }
  return data;
}

function sampleLabels(labels: string[]): string[] {
  if (!labels || labels.length === 0) return [];
  if (labels.length <= MAX_LABELS) return labels;
  const s = MAX_LABELS;
  const n = labels.length;
  const mq = Math.floor(n / (s + 1));
  const mr = n % (s + 1);
  const subset: string[] = [];
  for (let i = 1; i <= s; i++) {
    const c = i > mr ? mr : i - 1;
    const d = mq * i + c;
    subset.push(labels[d]);
  }
  return subset;
}

interface ChartData {
  values: Array<{ value: number; label: string; unitValue: number; unitCurrency: string }>;
  valueRange: [number, number];
}

function SVGChart({ data, width }: { data: ChartData; width: number }) {
  const { t } = useTranslation();
  const padding = { left: 2, right: 65, top: 20, bottom: 20 };
  const chartW = width - padding.left - padding.right;
  const chartH = CHART_HEIGHT - padding.top - padding.bottom;

  if (!data.values || data.values.length === 0) {
    return (
      <div style={{ height: CHART_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: colors.white }}>{t("fundDetails:chart.noData")}</span>
      </div>
    );
  }

  const { values, valueRange } = data;
  const [minVal, maxVal] = valueRange;
  const range = maxVal - minVal || 1;

  // Build SVG polyline points
  const points = values.map((v, i) => {
    const x = padding.left + (i / (values.length - 1 || 1)) * chartW;
    const y = padding.top + chartH - ((v.value - minVal) / range) * chartH;
    return `${x},${y}`;
  }).join(" ");

  // Y-axis ticks
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const val = minVal + (range * i) / (tickCount - 1);
    const y = padding.top + chartH - ((val - minVal) / range) * chartH;
    return { val, y };
  });

  // X-axis labels
  const allLabels = values.map(v => v.label);
  const sampledLabels = sampleLabels(allLabels);
  const monthLabels = sampledLabels.map(l => dayjs(l).format("MMM YYYY"));
  const dayLabels = sampledLabels.map(l => dayjs(l).format("D MMM YYYY"));
  const hasDuplicateMonths = new Set(monthLabels).size !== monthLabels.length;
  const displayLabels = hasDuplicateMonths ? dayLabels : monthLabels;

  // Find x positions for sampled labels
  const labelPositions = sampledLabels.map(label => {
    const idx = allLabels.indexOf(label);
    return padding.left + (idx / (values.length - 1 || 1)) * chartW;
  });

  return (
    <div>
      <svg width={width} height={CHART_HEIGHT} style={{ display: "block" }}>
        {/* Line */}
        <polyline
          fill="none"
          stroke={colors.accentTurquoise}
          strokeWidth={2}
          points={points}
        />
        {/* Y-axis labels */}
        {ticks.map((tick, i) => (
          <text
            key={i}
            x={width - 5}
            y={tick.y + 4}
            textAnchor="end"
            fill={colors.grey30}
            fontSize={12}
          >
            {`${tick.val >= 0 ? " " : ""}${numeral(tick.val).format("0,0.0%")}`}
          </text>
        ))}
      </svg>
      {/* X-axis labels below chart */}
      <div style={{ display: "flex", justifyContent: "space-around", paddingRight: 50, marginBottom: 10, minHeight: 20 }}>
        {displayLabels.map((label, i) => (
          <span key={i} style={{ color: colors.grey30, fontSize: 12 }}>{label}</span>
        ))}
      </div>
    </div>
  );
}

interface FundChartProps {
  fundId: string;
  baseCurrency?: string;
}

export default function FundChart({ fundId, baseCurrency = "SGD" }: FundChartProps) {
  const { t } = useTranslation();
  const { getPerformanceTypes, getPerformance } = useFundService();
  const [performanceTypes, setPerformanceTypes] = useState<PerformanceType[] | null>(null);
  const [selectedType, setSelectedType] = useState<PerformanceType | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(300);

  // Load performance types
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const types = await getPerformanceTypes(fundId);
        if (!cancelled) {
          setPerformanceTypes(types);
          if (types.length > 0) setSelectedType(types[0]);
        }
      } catch {
        if (!cancelled) setPerformanceTypes([]);
      }
    }
    setPerformanceTypes(null);
    setSelectedType(null);
    load();
    return () => { cancelled = true; };
  }, [fundId, getPerformanceTypes]);

  // Load performance data when type changes
  useEffect(() => {
    if (!selectedType) return;
    let cancelled = false;
    async function load() {
      setChartLoading(true);
      try {
        const raw = await getPerformance(fundId, selectedType!.value);
        const sampled = sampleData(raw);
        const { min, max, values } = sampled.reduce(
          (acc: { min: number; max: number; values: ChartData["values"] }, d: any) => {
            const perf = d.performance as number;
            const currencyKey = `navPerShare${baseCurrency.charAt(0).toUpperCase() + baseCurrency.slice(1).toLowerCase()}`;
            const unitValue = d[currencyKey] || 0;
            if (perf < acc.min) acc.min = perf;
            if (perf > acc.max) acc.max = perf;
            acc.values.push({ value: perf, label: d.date, unitValue, unitCurrency: baseCurrency });
            return acc;
          },
          { min: 0, max: 0, values: [] }
        );
        if (!cancelled) {
          setChartData({ values, valueRange: [min - 0.1 * Math.abs(max), max + 0.1 * Math.abs(max)] });
        }
      } catch {
        if (!cancelled) setChartData(null);
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [fundId, selectedType, baseCurrency, getPerformance]);

  const handleResize = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => observer.disconnect();
  }, []);

  if (performanceTypes === null) return null;

  if (performanceTypes.length === 0) {
    return (
      <div style={{ height: CHART_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: colors.white, fontSize: 14 }}>{t("fundDetails:chart.notEnoughData")}</span>
      </div>
    );
  }

  return (
    <div ref={handleResize} style={{ width: "100%" }}>
      {chartLoading ? (
        <div style={{ height: CHART_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${colors.grey400}`, borderTopColor: colors.white, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : chartData ? (
        <SVGChart data={chartData} width={containerWidth} />
      ) : null}

      {/* Time range selector */}
      {performanceTypes.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 10 }}>
          {performanceTypes.map(type => {
            const isSelected = selectedType?.value === type.value && performanceTypes.length > 1;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  paddingTop: 0,
                  paddingLeft: 5,
                  paddingRight: 5,
                  color: colors.grey30,
                  fontSize: 14,
                  fontWeight: "600",
                  borderBottom: isSelected ? `2px solid ${colors.teal500}` : "2px solid transparent",
                }}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}