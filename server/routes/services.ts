import { Router, Request, Response } from "express";
import { ServiceStatusChecker } from "../lib/serviceStatus";

const router = Router();

// GET /api/services - Get all services status
router.get("/", async (req: Request, res: Response) => {
  try {
    console.log("🔍 Checking all services status...");

    const result = await ServiceStatusChecker.checkAllServices();

    // Add timestamp and additional metadata
    const response = {
      ...result,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version
    };

    console.log("📊 Services status check completed:", {
      total: response.summary.total,
      working: response.summary.working,
      configured: response.summary.configured,
      timestamp: response.timestamp,
      nodeVersion: response.nodeVersion,
    });


    res.json(response);
  } catch (error: any) {
    console.error("❌ Services status check failed:", error);
    res.status(500).json({
      error: "Failed to check services status",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as servicesRouter };