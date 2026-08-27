import React, {
  cloneElement,
  isValidElement,
  useState,
} from "react";
import { cn } from "../../../lib/utils";
import {
  LegendItemProvider,
  LegendProvider,
} from "./legend-context";

export function Legend({
  items,
  hoveredIndex: controlledHoveredIndex,
  onHoverChange,
  title,
  titleClassName = "text-xs font-semibold text-slate-300 uppercase tracking-wider",
  className = "",
  children,
}) {
  const [internalHoveredIndex, setInternalHoveredIndex] = useState(null);

  const isControlled = controlledHoveredIndex !== undefined;
  const hoveredIndex = isControlled
    ? controlledHoveredIndex
    : internalHoveredIndex;

  const setHoveredIndex = (index) => {
    if (isControlled) {
      onHoverChange?.(index);
    } else {
      setInternalHoveredIndex(index);
    }
  };

  const contextValue = {
    items,
    hoveredIndex,
    setHoveredIndex,
  };

  return (
    <LegendProvider value={contextValue}>
      <div className={cn("legend-container flex flex-col gap-1.5", className)}>
        {title && (
          <h3 className={cn("mb-2 flex items-center justify-between", titleClassName)}>
            <span>{title}</span>
          </h3>
        )}
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isFaded = hoveredIndex !== null && hoveredIndex !== index;
          const percentage = item.maxValue
            ? (item.value / item.maxValue) * 100
            : 0;

          const itemContext = {
            item,
            index,
            isHovered,
            isFaded,
            percentage,
          };

          if (isValidElement(children)) {
            return (
              <LegendItemProvider key={item.label || index} value={itemContext}>
                {cloneElement(children)}
              </LegendItemProvider>
            );
          }

          return null;
        })}
      </div>
    </LegendProvider>
  );
}

Legend.displayName = "Legend";
export default Legend;
