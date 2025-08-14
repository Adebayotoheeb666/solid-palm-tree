import { RequestHandler } from "express";
import { supabaseServerHelpers } from "../lib/supabaseServer";

export const handleHealthCheck: RequestHandler = async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "unknown",
    services: {
      database: "unknown",
      supabase: "unknown",
      server: "healthy",
    },
    responseTime: 0,
  };

  try {
    // Check database connection
    try {
      const { data, error } = await supabaseServerHelpers.getAllAirports();
      if (!error && data && Array.isArray(data)) {
        health.services.database = "healthy";
        health.services.supabase = "healthy";
      } else {
        health.services.database = "error";
        health.services.supabase = "error";
        health.status = "degraded";
      }
    } catch (dbError) {
      console.error("Health check database error:", dbError);
      health.services.database = "error";
      health.services.supabase = "error";
      health.status = "degraded";
    }

    // Calculate response time
    health.responseTime = Date.now() - startTime;

    // Set appropriate status code
    const statusCode =
      health.status === "healthy"
        ? 200
        : health.status === "degraded"
          ? 200
          : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    console.error("Health check error:", error);

    health.status = "error";
    health.responseTime = Date.now() - startTime;

    res.status(503).json({
      ...health,
      error: "Internal server error during health check",
    });
  }
};

// Simplified health check for load balancers
export const handleSimpleHealthCheck: RequestHandler = (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
};
