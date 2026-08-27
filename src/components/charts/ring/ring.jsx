import React, { memo, useCallback } from "react";
import { motion, useTransform } from "motion/react";
import { ringCssVars, useRingHover, useRingStable } from "./ring-context";
import { useEnterComplete } from "../use-enter-complete";
import { useMountProgress } from "../use-mount-progress";

export function generateArcPath(
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  cornerRadius = 0
) {
  if (endAngle <= startAngle + 0.001) return "";

  const fullCircle = Math.abs(endAngle - startAngle) >= 2 * Math.PI - 0.001;

  if (fullCircle) {
    const midAngle = startAngle + Math.PI;
    const p1 = polarToCartesian(outerRadius, startAngle);
    const p2 = polarToCartesian(outerRadius, midAngle);
    const p3 = polarToCartesian(outerRadius, startAngle + 2 * Math.PI - 0.0001);

    const ip1 = polarToCartesian(innerRadius, startAngle);
    const ip2 = polarToCartesian(innerRadius, midAngle);
    const ip3 = polarToCartesian(innerRadius, startAngle + 2 * Math.PI - 0.0001);

    return [
      `M ${p1.x} ${p1.y}`,
      `A ${outerRadius} ${outerRadius} 0 0 1 ${p2.x} ${p2.y}`,
      `A ${outerRadius} ${outerRadius} 0 0 1 ${p3.x} ${p3.y}`,
      `L ${ip3.x} ${ip3.y}`,
      `A ${innerRadius} ${innerRadius} 0 0 0 ${ip2.x} ${ip2.y}`,
      `A ${innerRadius} ${innerRadius} 0 0 0 ${ip1.x} ${ip1.y}`,
      "Z",
    ].join(" ");
  }

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  const pStartOuter = polarToCartesian(outerRadius, startAngle);
  const pEndOuter = polarToCartesian(outerRadius, endAngle);
  const pStartInner = polarToCartesian(innerRadius, startAngle);
  const pEndInner = polarToCartesian(innerRadius, endAngle);

  const ringWidth = outerRadius - innerRadius;
  const capRadius = ringWidth / 2;

  if (cornerRadius > 0 && ringWidth > 0) {
    return [
      `M ${pStartOuter.x} ${pStartOuter.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${pEndOuter.x} ${pEndOuter.y}`,
      `A ${capRadius} ${capRadius} 0 0 1 ${pEndInner.x} ${pEndInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${pStartInner.x} ${pStartInner.y}`,
      `A ${capRadius} ${capRadius} 0 0 1 ${pStartOuter.x} ${pStartOuter.y}`,
      "Z",
    ].join(" ");
  }

  return [
    `M ${pStartOuter.x} ${pStartOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${pEndOuter.x} ${pEndOuter.y}`,
    `L ${pEndInner.x} ${pEndInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${pStartInner.x} ${pStartInner.y}`,
    "Z",
  ].join(" ");
}

function polarToCartesian(radius, angleInRadians) {
  return {
    x: radius * Math.cos(angleInRadians),
    y: radius * Math.sin(angleInRadians),
  };
}

function ringHoverScale(isHovered, isPushedOut) {
  if (isHovered) return 1.03;
  if (isPushedOut) return 1.015;
  return 1;
}

function RingProgressPath({
  progressComplete,
  progressPath,
  animatedProgressPath,
  color,
}) {
  if (progressComplete) {
    if (!progressPath) return null;
    return <path d={progressPath} fill={color} />;
  }
  return <motion.path d={animatedProgressPath} fill={color} />;
}

export const Ring = memo(function Ring({
  index,
  color: colorProp,
  animate = true,
  showGlow = true,
  lineCap = "round",
}) {
  const {
    data,
    getColor,
    getRingRadii,
    startAngle,
    endAngle,
    enterTransition,
    enterStaggerScale = 1,
    animationKey,
  } = useRingStable();
  const { hoveredIndex, setHoveredIndex } = useRingHover();

  const expandDelay = index * 0.08 * enterStaggerScale;
  const expandProgress = useMountProgress(
    enterTransition,
    expandDelay,
    `${animationKey}-expand-${index}`
  );
  const expandComplete = useEnterComplete(expandProgress);

  const progressDelay = (0.4 + index * 0.1) * enterStaggerScale;
  const progressMount = useMountProgress(
    enterTransition,
    progressDelay,
    `${animationKey}-progress-${index}`
  );
  const progressComplete = useEnterComplete(progressMount);

  const ringData = data[index];
  const maxVal = ringData?.maxValue || 1;
  const progress = ringData ? Math.min(1, Math.max(0, ringData.value / maxVal)) : 0;
  const arcRange = endAngle - startAngle;

  const animatedProgressPath = useTransform(progressMount, (v) => {
    if (!ringData) return "";
    const currentEndAngle = startAngle + arcRange * progress * v;
    if (currentEndAngle <= startAngle + 0.01) return "";
    const radii = getRingRadii(index);
    const corner =
      lineCap === "round" ? (radii.outerRadius - radii.innerRadius) / 2 : 0;
    return generateArcPath(
      radii.innerRadius,
      radii.outerRadius,
      startAngle,
      currentEndAngle,
      corner
    );
  });

  const enterScale = useTransform(expandProgress, [0, 1], [0, 1]);

  const handleMouseEnter = useCallback(
    () => setHoveredIndex(index),
    [index, setHoveredIndex]
  );
  const handleMouseLeave = useCallback(
    () => setHoveredIndex(null),
    [setHoveredIndex]
  );

  if (!ringData) return null;

  const { innerRadius, outerRadius } = getRingRadii(index);
  const color = colorProp || ringData.color || getColor(index);

  const isHovered = hoveredIndex === index;
  const isFaded = hoveredIndex !== null && hoveredIndex !== index;
  const isPushedOut = hoveredIndex !== null && hoveredIndex < index;

  const cornerRadius =
    lineCap === "round" ? (outerRadius - innerRadius) / 2 : 0;
  const bgPath = generateArcPath(
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    cornerRadius
  );
  const progressEndAngle = startAngle + arcRange * progress;
  const progressPath =
    progressEndAngle <= startAngle + 0.01
      ? ""
      : generateArcPath(
          innerRadius,
          outerRadius,
          startAngle,
          progressEndAngle,
          cornerRadius
        );

  const hoverScale = ringHoverScale(isHovered, isPushedOut);
  const layerOpacity = isFaded ? 0.3 : 1;
  const enterDone = !animate || (expandComplete && progressComplete);

  const groupStyle = {
    cursor: "pointer",
    transformOrigin: "0px 0px",
    filter: showGlow && isHovered ? `drop-shadow(0 0 12px ${color})` : "none",
    transition: "filter 0.2s ease",
  };

  if (enterDone) {
    return (
      <motion.g
        animate={{ scale: hoverScale, opacity: layerOpacity }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={groupStyle}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 25 },
          opacity: { duration: 0.15 },
        }}
      >
        <path d={bgPath} fill={ringCssVars.ringBackground} />
        {progressPath ? <path d={progressPath} fill={color} /> : null}
      </motion.g>
    );
  }

  if (!expandComplete) {
    return (
      <motion.g
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          ...groupStyle,
          scale: enterScale,
          opacity: layerOpacity,
        }}
      >
        <path d={bgPath} fill={ringCssVars.ringBackground} />
      </motion.g>
    );
  }

  return (
    <motion.g
      animate={{ scale: hoverScale, opacity: layerOpacity }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={groupStyle}
      transition={{
        scale: { type: "spring", stiffness: 400, damping: 25 },
        opacity: { duration: 0.15 },
      }}
    >
      <path d={bgPath} fill={ringCssVars.ringBackground} />
      <RingProgressPath
        animatedProgressPath={animatedProgressPath}
        color={color}
        progressComplete={progressComplete}
        progressPath={progressPath}
      />
    </motion.g>
  );
});

Ring.displayName = "Ring";
export default Ring;
