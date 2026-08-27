import React from "react";
import { cn } from "../../../lib/utils";
import {
  chartCenterContainerClassName,
  chartCenterLabelClassName,
  chartCenterValueClassName,
} from "../chart-center-typography";
import { ChartStatFlow } from "../chart-stat-flow";
import { intFmt, percentFmt } from "../chart-formatters";
import { useRingHover, useRingStable } from "./ring-context";

export function RingCenter({
  defaultLabel = "Total Leads",
  formatValue = intFmt,
  children,
  className = "",
  valueClassName = chartCenterValueClassName,
  labelClassName = chartCenterLabelClassName,
  sublabelClassName = "text-[10px] text-cyan-400 font-semibold mt-0.5",
  prefix = "",
  suffix = "",
}) {
  const { data, totalValue, baseInnerRadius } = useRingStable();
  const { hoveredIndex } = useRingHover();

  const hoveredData = hoveredIndex === null || hoveredIndex === undefined ? null : data[hoveredIndex];
  const displayValue = hoveredData ? hoveredData.value : totalValue;
  const displayLabel = hoveredData ? hoveredData.label : defaultLabel;
  const percentage = hoveredData && totalValue > 0 ? (hoveredData.value / totalValue) * 100 : null;

  const centerSize = Math.max(50, baseInnerRadius * 2 - 12);

  if (children && hoveredData) {
    return (
      <div
        className={cn(
          chartCenterContainerClassName,
          "flex items-center justify-center",
          className
        )}
        style={{ width: centerSize, height: centerSize }}
      >
        {children({
          value: displayValue,
          label: displayLabel,
          isHovered: hoveredIndex !== null,
          data: hoveredData,
          percentage,
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        chartCenterContainerClassName,
        "flex flex-col items-center justify-center text-center p-2",
        className
      )}
      style={{ width: centerSize, height: centerSize }}
    >
      <ChartStatFlow
        formatValue={formatValue}
        label={displayLabel}
        labelClassName={labelClassName}
        sublabel={percentage !== null ? `${percentage.toFixed(0)}% share` : hoveredData ? undefined : `${data.length} Practices`}
        sublabelClassName={sublabelClassName}
        prefix={prefix}
        suffix={suffix}
        value={displayValue}
        valueClassName={valueClassName}
      />
    </div>
  );
}

RingCenter.displayName = "RingCenter";
export default RingCenter;
