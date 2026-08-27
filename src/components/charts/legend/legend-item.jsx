import React from "react";
import { cn } from "../../../lib/utils";
import { useLegend, useLegendItem } from "./legend-context";

export function LegendItem({ className = "", children }) {
  const { setHoveredIndex } = useLegend();
  const { index, isHovered, isFaded } = useLegendItem();

  return (
    <div
      className={cn(
        "cursor-pointer rounded-xl p-2.5 transition-all duration-200 ease-out border border-transparent",
        isHovered && "bg-slate-800/80 border-slate-700/80 shadow-lg scale-[1.01]",
        isFaded && "opacity-40",
        className
      )}
      data-hovered={isHovered ? "" : undefined}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {children}
    </div>
  );
}

LegendItem.displayName = "LegendItem";
