import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    target: "es2020",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: mode === "development",
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-accordion',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip'
          ],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'icons-vendor': ['lucide-react'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority']
        },
        // Optimized chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `js/${facadeModuleId}_[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]_[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]_[hash][extname]`;
          }
          return `assets/[name]_[hash][extname]`;
        },
        entryFileNames: `js/[name]_[hash].js`
      }
    },
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
        pure_funcs: mode === "production" ? ['console.log', 'console.info'] : []
      }
    }
  },
  plugins: [
    react({
      // Enable Fast Refresh
      fast: true
    }),
    expressPlugin()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "lucide-react",
      "clsx",
      "tailwind-merge"
    ],
    exclude: ["@vite/client", "@vite/env"]
  },
  esbuild: {
    target: "es2020",
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
