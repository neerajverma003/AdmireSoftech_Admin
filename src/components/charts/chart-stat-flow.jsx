import React, { useMemo } from "react";
import { cn } from "../../lib/utils";
import { intFmt, percentFmt } from "./chart-formatters";

export function ChartStatFlow({
  value,
  label,
  sublabel,
  prefix = "",
  suffix = "",
  formatValue,
  valueClassName = "text-2xl font-bold",
  labelClassName = "text-xs",
  sublabelClassName = "text-[10px] text-cyan-400 font-medium",
  icon,
}) {
  const displayVal = useMemo(() => {
    if (formatValue) return formatValue(value);
    return intFmt(value);
  }, [value, formatValue]);

  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      {icon ? (
        <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/80 border border-slate-700">
          {icon}
        </div>
      ) : null}
      <span className={cn("text-slate-100 tabular-nums tracking-tight font-extrabold", valueClassName)}>
        {prefix}
        {displayVal}
        {suffix}
      </span>
      <span className={cn("mt-0.5 text-slate-400 font-medium", labelClassName)}>
        {label}
      </span>
      {sublabel && (
        <span className={cn("mt-0.5", sublabelClassName)}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

ChartStatFlow.displayName = "ChartStatFlow";
