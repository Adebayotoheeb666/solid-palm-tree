#!/usr/bin/env node

/**
 * Development server for API routes
 * Runs on port 3001 to work with Vite proxy
 */

import { createServer } from "./server/index.js";

const PORT = process.env.API_PORT || 3001;

async function startDevServer() {
  try {
    const app = await createServer();
    
    app.listen(PORT, () => {
      console.log(`🚀 API Server running on port ${PORT}`);
      console.log(`🔧 API: http://localhost:${PORT}/api`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`🔗 Proxied from Vite dev server on port 8080`);
    });
  } catch (error) {
    console.error("❌ Failed to start API server:", error);
    process.exit(1);
  }
}

startDevServer();
