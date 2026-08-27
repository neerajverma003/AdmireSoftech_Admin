import React from "react";
import { cn } from "../../../lib/utils";
import { useLegendItem } from "./legend-context";

export function LegendProgress({
  trackClassName = "bg-slate-800/90 border border-slate-700/50",
  indicatorClassName = "",
  height = "h-1.5",
}) {
  const { item, percentage } = useLegendItem();

  if (!item.maxValue) {
    return null;
  }

  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full",
        height,
        trackClassName
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          indicatorClassName
        )}
        style={{
          width: `${clampedPercentage}%`,
          backgroundColor: item.color || "#00f2fe",
          boxShadow: `0 0 10px ${item.color || "#00f2fe"}60`,
        }}
      />
    </div>
  );
}

LegendProgress.displayName = "LegendProgress";
