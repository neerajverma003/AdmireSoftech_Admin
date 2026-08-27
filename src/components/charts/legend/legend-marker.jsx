import React from "react";
import { cn } from "../../../lib/utils";
import { useLegendItem } from "./legend-context";

export function LegendMarker({ className = "h-2.5 w-2.5" }) {
  const { item } = useLegendItem();

  return (
    <div
      className={cn("shrink-0 rounded-full shadow-sm", className)}
      style={{
        backgroundColor: item.color || "#00f2fe",
        boxShadow: `0 0 8px ${item.color || "#00f2fe"}40`,
      }}
    />
  );
}

LegendMarker.displayName = "LegendMarker";
