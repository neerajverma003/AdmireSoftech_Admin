import React from "react";
import { cn } from "../../../lib/utils";
import { useLegendItem } from "./legend-context";

export function LegendLabel({
  className = "text-xs font-medium",
}) {
  const { item } = useLegendItem();

  return (
    <span className={cn("text-slate-200 truncate", className)}>
      {item.label}
    </span>
  );
}

LegendLabel.displayName = "LegendLabel";
