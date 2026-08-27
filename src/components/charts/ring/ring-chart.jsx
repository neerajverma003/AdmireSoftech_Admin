import React, {
  Children,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ParentSize } from "@visx/responsive";
import { cn } from "../../../lib/utils";
import {
  defaultRingColors,
  RingProvider,
  ringCssVars,
} from "./ring-context";

function isRingCenter(child) {
  return (
    isValidElement(child) &&
    typeof child.type === "function" &&
    (child.type.displayName === "RingCenter" || child.type.name === "RingCenter")
  );
}

function isRing(child) {
  return (
    isValidElement(child) &&
    typeof child.type === "function" &&
    (child.type.displayName === "Ring" || child.type.name === "Ring")
  );
}

function RingChartInner(props) {
  const size = Math.min(props.width, props.height);
  if (size < 10) {
    return null;
  }
  return <RingChartCore {...props} />;
}

const RingChartCore = memo(function RingChartCore({
  width,
  height,
  data,
  strokeWidth: strokeWidthProp = 12,
  ringGap: ringGapProp = 6,
  baseInnerRadius: baseInnerRadiusProp = 60,
  children,
  containerRef,
  hoveredIndexProp,
  onHoverChange,
  startAngle = -Math.PI / 2,
  endAngle = (3 * Math.PI) / 2,
  enterTransition,
  enterStaggerScale = 1,
  geometryScrubbing = false,
}) {
  const [internalHoveredIndex, setInternalHoveredIndex] = useState(null);
  const [animationKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const isControlled = hoveredIndexProp !== undefined;
  const hoveredIndex = isControlled ? hoveredIndexProp : internalHoveredIndex;
  const setHoveredIndex = useCallback(
    (index) => {
      if (isControlled) {
        onHoverChange?.(index);
      } else {
        setInternalHoveredIndex(index);
      }
    },
    [isControlled, onHoverChange]
  );

  const size = Math.min(width, height);
  const center = size / 2;

  const ringCount = data.length || 1;
  const padding = 10;
  const availableRadius = center - padding;

  const designOuterRadius =
    baseInnerRadiusProp +
    (ringCount - 1) * (strokeWidthProp + ringGapProp) +
    strokeWidthProp;

  const scale = Math.min(1, Math.max(0.2, availableRadius / designOuterRadius));

  const strokeWidth = strokeWidthProp * scale;
  const ringGap = ringGapProp * scale;
  const baseInnerRadius = baseInnerRadiusProp * scale;

  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + (d.value || 0), 0),
    [data]
  );

  const getColor = useCallback(
    (index) => {
      const item = data[index];
      if (item?.color) {
        return item.color;
      }
      return defaultRingColors[index % defaultRingColors.length];
    },
    [data]
  );

  const getRingRadii = useCallback(
    (index) => {
      const innerRadius = baseInnerRadius + index * (strokeWidth + ringGap);
      const outerRadius = innerRadius + strokeWidth;
      return { innerRadius, outerRadius };
    },
    [baseInnerRadius, strokeWidth, ringGap]
  );

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [enterTransition, enterStaggerScale, geometryScrubbing]);

  const { svgChildren, centerChildren } = useMemo(() => {
    const svgNodes = [];
    const centerNodes = [];

    Children.forEach(children, (child) => {
      if (isRingCenter(child)) {
        centerNodes.push(child);
      } else {
        svgNodes.push(child);
      }
    });

    return { svgChildren: svgNodes, centerChildren: centerNodes };
  }, [children]);

  const contextValue = useMemo(
    () => ({
      data,
      size,
      center,
      strokeWidth,
      ringGap,
      baseInnerRadius,
      hoveredIndex,
      setHoveredIndex,
      animationKey,
      isLoaded,
      enterTransition,
      enterStaggerScale,
      containerRef,
      totalValue,
      getColor,
      getRingRadii,
      startAngle,
      endAngle,
      geometryScrubbing,
    }),
    [
      data,
      size,
      center,
      strokeWidth,
      ringGap,
      baseInnerRadius,
      hoveredIndex,
      setHoveredIndex,
      animationKey,
      isLoaded,
      enterTransition,
      enterStaggerScale,
      containerRef,
      totalValue,
      getColor,
      getRingRadii,
      startAngle,
      endAngle,
      geometryScrubbing,
    ]
  );

  return (
    <RingProvider value={contextValue}>
      <div
        className="grid select-none relative"
        style={{
          gridTemplateColumns: "1fr",
          gridTemplateRows: "1fr",
          width: size,
          height: size,
          margin: "0 auto",
        }}
      >
        {/* SVG layer with animated rings */}
        <svg
          aria-hidden="true"
          height={size}
          style={{ gridArea: "1 / 1", contain: "layout style paint" }}
          width={size}
          className="overflow-visible"
        >
          <g transform={`translate(${center}, ${center})`}>
            {svgChildren}
          </g>
        </svg>

        {/* HTML layer with center content */}
        {centerChildren.length > 0 && (
          <div
            className="pointer-events-none flex items-center justify-center z-10"
            style={{ gridArea: "1 / 1" }}
          >
            {centerChildren}
          </div>
        )}
      </div>
    </RingProvider>
  );
});

export function RingChart({
  data,
  size: fixedSize,
  strokeWidth = 12,
  ringGap = 6,
  baseInnerRadius = 60,
  className = "",
  hoveredIndex,
  onHoverChange,
  startAngle = -Math.PI / 2,
  endAngle = (3 * Math.PI) / 2,
  enterTransition,
  enterStaggerScale = 1,
  geometryScrubbing = false,
  children,
}) {
  const containerRef = useRef(null);

  if (fixedSize) {
    return (
      <div
        className={cn("relative flex items-center justify-center", className)}
        ref={containerRef}
        style={{ width: fixedSize, height: fixedSize }}
      >
        <RingChartInner
          baseInnerRadius={baseInnerRadius}
          containerRef={containerRef}
          data={data}
          endAngle={endAngle}
          enterStaggerScale={enterStaggerScale}
          enterTransition={enterTransition}
          geometryScrubbing={geometryScrubbing}
          height={fixedSize}
          hoveredIndexProp={hoveredIndex}
          onHoverChange={onHoverChange}
          ringGap={ringGap}
          startAngle={startAngle}
          strokeWidth={strokeWidth}
          width={fixedSize}
        >
          {children}
        </RingChartInner>
      </div>
    );
  }

  return (
    <div
      className={cn("relative aspect-square w-full min-h-[220px] flex items-center justify-center", className)}
      ref={containerRef}
    >
      <ParentSize debounceTime={10}>
        {({ width, height }) => (
          <RingChartInner
            baseInnerRadius={baseInnerRadius}
            containerRef={containerRef}
            data={data}
            endAngle={endAngle}
            enterStaggerScale={enterStaggerScale}
            enterTransition={enterTransition}
            geometryScrubbing={geometryScrubbing}
            height={height || width || 260}
            hoveredIndexProp={hoveredIndex}
            onHoverChange={onHoverChange}
            ringGap={ringGap}
            startAngle={startAngle}
            strokeWidth={strokeWidth}
            width={width || 260}
          >
            {children}
          </RingChartInner>
        )}
      </ParentSize>
    </div>
  );
}

export default RingChart;
