import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CacheReset: React.FC = () => {
  const handleCacheReset = async () => {
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }

      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => {
            console.log('Unregistering service worker');
            return registration.unregister();
          })
        );
      }

      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();

      alert('Cache cleared successfully! The page will now reload.');
      
      // Force reload with cache bypass
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache. Please try refreshing the page manually.');
    }
  };

  const handleHardRefresh = () => {
    // Perform hard refresh (Ctrl+F5 equivalent)
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Cache & Performance Reset</CardTitle>
              <CardDescription>
                If you're experiencing issues with the app (missing files, old versions, etc.), 
                you can clear your browser cache and reset the application state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  <strong>Common issues this fixes:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>404 errors for JavaScript or CSS files</li>
                    <li>App showing old version after updates</li>
                    <li>Service worker caching problems</li>
                    <li>Asset loading failures</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Full Cache Reset</h3>
                  <p className="text-muted-foreground mb-4">
                    This will clear all cached data, unregister service workers, 
                    and reload the page with fresh content.
                  </p>
                  <Button onClick={handleCacheReset} className="w-full">
                    Clear All Cache & Reload
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Simple Refresh</h3>
                  <p className="text-muted-foreground mb-4">
                    This will just reload the page normally.
                  </p>
                  <Button variant="outline" onClick={handleHardRefresh} className="w-full">
                    Refresh Page
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Manual Instructions</h3>
                <p className="text-muted-foreground text-sm">
                  If the automatic reset doesn't work, you can manually clear your browser cache:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Chrome/Edge:</strong> Ctrl+Shift+Delete → Clear browsing data</li>
                  <li><strong>Firefox:</strong> Ctrl+Shift+Delete → Clear recent history</li>
                  <li><strong>Safari:</strong> Develop → Empty caches</li>
                  <li><strong>Alternative:</strong> Open DevTools (F12) → Right-click refresh → Hard reload</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CacheReset;
