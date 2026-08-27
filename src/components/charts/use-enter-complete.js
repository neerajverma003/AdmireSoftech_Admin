import { useEffect, useState } from "react";

export function useEnterComplete(motionValue) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!motionValue) {
      setComplete(true);
      return;
    }

    const check = (val) => {
      if (val >= 0.999) {
        setComplete(true);
      }
    };

    const unsubscribe = motionValue.on("change", check);
    if (motionValue.get() >= 0.999) {
      setComplete(true);
    }

    return () => unsubscribe();
  }, [motionValue]);

  return complete;
}
