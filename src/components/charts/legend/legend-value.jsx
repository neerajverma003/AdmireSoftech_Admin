import React from "react";
import { cn } from "../../../lib/utils";
import { intFmt } from "../chart-formatters";
import { useLegendItem } from "./legend-context";

export function LegendValue({
  className = "text-xs tabular-nums",
  showPercentage = true,
  percentageClassName = "text-[10px] text-cyan-400 font-semibold",
  formatValue = intFmt,
  formatPercentage = (p) => `${p.toFixed(0)}%`,
}) {
  const { item, percentage } = useLegendItem();

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-slate-300 font-semibold ml-auto",
        className
      )}
    >
      <span>{formatValue(item.value)}</span>
      {showPercentage && item.maxValue && (
        <span className={percentageClassName}>
          ({formatPercentage(percentage)})
        </span>
      )}
    </span>
  );
}

LegendValue.displayName = "LegendValue";
