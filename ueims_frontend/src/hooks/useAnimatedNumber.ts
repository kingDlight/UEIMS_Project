import { useState, useEffect } from 'react';

export const useAnimatedNumber = (endValue: number, duration: number = 1200, delay: number = 0): number => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    let reqId: number;
    let timeoutId: number;

    const animate = () => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.round(startValue + ease * (endValue - startValue)));
        
        if (progress < 1) {
          reqId = window.requestAnimationFrame(step);
        }
      };
      reqId = window.requestAnimationFrame(step);
    };

    if (delay > 0) {
      timeoutId = window.setTimeout(animate, delay);
    } else {
      animate();
    }

    return () => {
      window.cancelAnimationFrame(reqId);
      window.clearTimeout(timeoutId);
    };
  }, [endValue, duration, delay]);

  return displayValue;
};
