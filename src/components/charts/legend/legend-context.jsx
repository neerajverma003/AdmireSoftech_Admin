import React, { createContext, useContext } from "react";

export const legendCssVars = {
  background: "#0b1329",
  foreground: "#f8fafc",
  muted: "#1e293b",
  mutedForeground: "#94a3b8",
  track: "rgba(30, 41, 59, 0.6)",
};

const LegendContext = createContext(null);
const LegendItemContext = createContext(null);

export function LegendProvider({ children, value }) {
  return (
    <LegendContext.Provider value={value}>{children}</LegendContext.Provider>
  );
}

export function LegendItemProvider({ children, value }) {
  return (
    <LegendItemContext.Provider value={value}>
      {children}
    </LegendItemContext.Provider>
  );
}

export function useLegend() {
  const context = useContext(LegendContext);
  if (!context) {
    throw new Error("useLegend must be used within a <Legend> component.");
  }
  return context;
}

export function useLegendItem() {
  const context = useContext(LegendItemContext);
  if (!context) {
    throw new Error("useLegendItem must be used within a <LegendItem> component.");
  }
  return context;
}
