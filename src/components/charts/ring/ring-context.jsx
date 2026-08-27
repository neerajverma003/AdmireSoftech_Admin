import React, { createContext, useContext, useMemo } from "react";

export const ringCssVars = {
  background: "#0b1329",
  foreground: "#f8fafc",
  foregroundMuted: "#94a3b8",
  label: "#64748b",
  ringBackground: "rgba(30, 41, 59, 0.45)", // sleek slate-800 translucent track
  ring1: "#00f2fe", // Cyber Cyan
  ring2: "#818cf8", // Indigo Neon
  ring3: "#38bdf8", // Sky Blue
  ring4: "#c084fc", // Purple Glow
  ring5: "#34d399", // Emerald Green
  ring6: "#fbbf24", // Amber Gold
};

export const defaultRingColors = [
  ringCssVars.ring1,
  ringCssVars.ring2,
  ringCssVars.ring3,
  ringCssVars.ring4,
  ringCssVars.ring5,
  ringCssVars.ring6,
];

const RingStableContext = createContext(null);
const RingHoverContext = createContext(null);

export function RingProvider({ children, value }) {
  const stable = useMemo(
    () => ({
      data: value.data,
      size: value.size,
      center: value.center,
      strokeWidth: value.strokeWidth,
      ringGap: value.ringGap,
      baseInnerRadius: value.baseInnerRadius,
      animationKey: value.animationKey,
      isLoaded: value.isLoaded,
      enterTransition: value.enterTransition,
      enterStaggerScale: value.enterStaggerScale,
      containerRef: value.containerRef,
      totalValue: value.totalValue,
      getColor: value.getColor,
      getRingRadii: value.getRingRadii,
      startAngle: value.startAngle,
      endAngle: value.endAngle,
      geometryScrubbing: value.geometryScrubbing,
    }),
    [
      value.data,
      value.size,
      value.center,
      value.strokeWidth,
      value.ringGap,
      value.baseInnerRadius,
      value.animationKey,
      value.isLoaded,
      value.enterTransition,
      value.enterStaggerScale,
      value.containerRef,
      value.totalValue,
      value.getColor,
      value.getRingRadii,
      value.startAngle,
      value.endAngle,
      value.geometryScrubbing,
    ]
  );

  const hover = useMemo(
    () => ({
      hoveredIndex: value.hoveredIndex,
      setHoveredIndex: value.setHoveredIndex,
    }),
    [value.hoveredIndex, value.setHoveredIndex]
  );

  return (
    <RingStableContext.Provider value={stable}>
      <RingHoverContext.Provider value={hover}>
        {children}
      </RingHoverContext.Provider>
    </RingStableContext.Provider>
  );
}

export function useRingStable() {
  const context = useContext(RingStableContext);
  if (!context) {
    throw new Error("useRingStable must be used within a RingProvider.");
  }
  return context;
}

export function useRingHover() {
  const context = useContext(RingHoverContext);
  if (!context) {
    throw new Error("useRingHover must be used within a RingProvider.");
  }
  return context;
}

export function useRing() {
  return { ...useRingStable(), ...useRingHover() };
}

export default RingStableContext;
