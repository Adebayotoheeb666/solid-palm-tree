
import { Router, Request, Response } from "express";
import { ServiceStatusChecker } from "../lib/serviceStatus";

const router = Router();

// GET /api/services - Get all services status
router.get("/", async (req: Request, res: Response) => {
  try {
    console.log("🔍 Checking all services status...");
    
    const result = await ServiceStatusChecker.checkAllServices();
    
    console.log("📊 Services status check completed:", {
      total: result.summary.total,
      working: result.summary.working,
      configured: result.summary.configured,
    });
    
    res.json(result);
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
