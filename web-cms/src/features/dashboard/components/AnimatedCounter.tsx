'use client';

import React, { useEffect, useState } from 'react';

export function AnimatedCounter({
  value,
  formatter,
  duration = 720,
}: {
  value: number;
  formatter: (val: number) => string;
  duration?: number;
}) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const startVal = 0;
    const endVal = Number(value) || 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplayVal(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplayVal(endVal);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return <>{formatter(displayVal)}</>;
}
