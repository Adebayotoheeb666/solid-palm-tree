// Cache clearing utility
(function() {
  try {
    // Clear all caches
    async function clearAllCaches() {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }
    }

    // Unregister service worker
    async function unregisterServiceWorker() {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => {
            console.log('Unregistering service worker');
            return registration.unregister();
          })
        );
      }
    }

    // Full cache clear and reload
    async function fullCacheReset() {
      try {
        await clearAllCaches();
        await unregisterServiceWorker();

        // Clear local storage and session storage
        localStorage.clear();
        sessionStorage.clear();

        console.log('All caches cleared. Reloading...');

        // Force reload with cache bypass
        window.location.reload(true);
      } catch (error) {
        console.error('Error clearing caches:', error);
        // Fallback: just reload
        window.location.reload(true);
      }
    }

    // Expose function globally for manual use
    window.clearAppCache = fullCacheReset;

    // Auto-clear cache if we detect asset loading errors
    let errorCount = 0;

    window.addEventListener('error', function(e) {
      if (e.filename && e.filename.match(/\.(js|css)$/i)) {
        errorCount++;
        console.warn('Asset loading error detected:', e.filename);

        // If we get multiple asset errors, clear cache automatically
        if (errorCount >= 2) {
          console.log('Multiple asset errors detected, clearing cache...');
          if (typeof fullCacheReset === 'function') {
            fullCacheReset();
          }
        }
      }
    });
  } catch (error) {
    console.error('Cache clearing failed:', error);
    // Fallback to simple reload
    window.location.reload(true);
  }
})();