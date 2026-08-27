import { animate, useMotionValue } from "motion/react";
import { useEffect } from "react";

export function useMountProgress(
  customTransition,
  delaySeconds = 0,
  key = ""
) {
  const progress = useMotionValue(0);

  useEffect(() => {
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 1.1,
      delay: delaySeconds,
      ease: [0.85, 0, 0.15, 1],
      ...customTransition,
    });

    return () => controls.stop();
  }, [progress, delaySeconds, key, customTransition]);

  return progress;
}
