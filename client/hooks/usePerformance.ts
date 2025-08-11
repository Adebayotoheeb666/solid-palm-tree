import { useEffect } from "react";

interface PerformanceMetrics {
  componentName: string;
  renderTime?: number;
  mountTime?: number;
}

export const usePerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Only log in development mode
      if (import.meta.env.DEV && renderTime > 100) {
        console.warn(
          `${componentName} took ${renderTime.toFixed(2)}ms to render`,
        );
      }
    };
  }, [componentName]);
};

export const measurePerformance = (fn: () => void, label: string) => {
  const start = performance.now();
  fn();
  const end = performance.now();

  if (import.meta.env.DEV) {
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  }
};

export const useComponentMetrics = (componentName: string) => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes(componentName)) {
          console.log(`${componentName} metrics:`, {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      }
    });

    observer.observe({ entryTypes: ["measure", "navigation", "resource"] });

    return () => observer.disconnect();
  }, [componentName]);
};
