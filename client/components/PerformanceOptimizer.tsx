import React, { useEffect } from "react";

const PerformanceOptimizer: React.FC = () => {
  useEffect(() => {
    // Register Service Worker with better update handling
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);

          // Check for updates on each page load
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available, clear caches and reload
                  console.log('New service worker available, updating...');
                  window.location.reload();
                }
              });
            }
          });

          // Periodically check for updates
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }

    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalImages = [
        "/onboard/logos.png",
        "/hero.png",
        "/onboard/logos-01.png",
        "/onboard/fast.png",
        "/onboard/secure.png",
        "/onboard/verifiable.png",
      ];

      criticalImages.forEach((src) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Preload on idle
    if ("requestIdleCallback" in window) {
      requestIdleCallback(preloadCriticalResources);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(preloadCriticalResources, 1000);
    }

    // Prefetch likely navigation targets
    const prefetchPages = () => {
      const likelyPages = ["/login", "/register", "/contact", "/userform"];

      likelyPages.forEach((href) => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = href;
        document.head.appendChild(link);
      });
    };

    // Prefetch after initial load
    setTimeout(prefetchPages, 2000);

    // Performance monitoring
    if ("performance" in window && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log long tasks (> 50ms)
          if (entry.entryType === "longtask" && entry.duration > 50) {
            console.warn("Long task detected:", entry.duration + "ms");
          }

          // Log large layout shifts
          if (entry.entryType === "layout-shift" && entry.value > 0.1) {
            console.warn("Layout shift detected:", entry.value);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ["longtask", "layout-shift"] });
      } catch (e) {
        console.log("Performance monitoring not fully supported");
      }

      return () => observer.disconnect();
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default PerformanceOptimizer;
