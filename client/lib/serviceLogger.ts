interface ServiceStatus {
  name: string;
  status: "working" | "error" | "unknown";
  message?: string;
  timestamp: string;
}

class ServiceLogger {
  private services: Map<string, ServiceStatus> = new Map();
  private logInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startLogging();
    this.checkInitialServices();
  }

  private checkInitialServices() {
    // Check various services on startup
    this.checkService("Authentication", this.checkAuth.bind(this));
    this.checkService("Database", this.checkDatabase.bind(this));
    this.checkService("Email Service", this.checkEmailService.bind(this));
    this.checkService("Stripe", this.checkStripe.bind(this));
    this.checkService("Amadeus API", this.checkAmadeus.bind(this));
    this.checkService("Supabase", this.checkSupabase.bind(this));
  }

  private async checkAuth(): Promise<{
    status: "working" | "error";
    message?: string;
  }> {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        // Try to validate token
        const response = await fetch("/api/auth/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          return {
            status: "working",
            message: "Authentication service operational",
          };
        }
      }
      return {
        status: "working",
        message: "Authentication service ready (not logged in)",
      };
    } catch (error) {
      return { status: "error", message: `Auth check failed: ${error}` };
    }
  }

  private async checkDatabase(): Promise<{
    status: "working" | "error";
    message?: string;
  }> {
    try {
      const response = await fetch("/api/health/database");
      if (response.ok) {
        const data = await response.json();
        // Safe access to nested properties
        const overallStatus = data?.overall?.status;
        if (overallStatus === "healthy") {
          return {
            status: "working",
            message: "Database health check completed"
          };
        } else if (overallStatus) {
          return {
            status: "error",
            message: `Database status: ${overallStatus}`
          };
        } else {
          return {
            status: "error",
            message: "Invalid database health response format"
          };
        }
      }
      return { status: "error", message: `Database health check failed: ${response.status}` };
    } catch (error) {
      return { status: "error", message: `Database check failed: ${error}` };
    }
  }

  private async checkEmailService(): Promise<{
    status: "working" | "error";
    message?: string;
  }> {
    try {
      // Check if email service is configured by examining environment
      const isConfigured =
        document.cookie.includes("email_configured=true") ||
        window.location.hostname !== "localhost";

      if (isConfigured) {
        return { status: "working", message: "Email service configured" };
      }
      return {
        status: "error",
        message: "Email service not configured (SendGrid)",
      };
    } catch (error) {
      return {
        status: "error",
        message: `Email service check failed: ${error}`,
      };
    }
  }

  private async checkStripe(): Promise<{
    status: "working" | "error";
    message?: string;
  }> {
    try {
      // Check if Stripe configuration exists by testing the endpoint
      const response = await fetch("/api/payments/config", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const config = await response.json();
        if (config.publishableKey) {
          return { 
            status: "working", 
            message: "Stripe payment service configured" 
          };
        }
      }

      // Fallback: Check if Stripe is loaded in window
      if (typeof window !== "undefined" && (window as any).Stripe) {
        return { status: "working", message: "Stripe client loaded" };
      }

      return { 
        status: "error", 
        message: "Stripe payment service not configured or loaded" 
      };
    } catch (error) {
      return { status: "error", message: `Stripe check failed: ${error}` };
    }
  }

  private async checkAmadeus(): Promise<{
    status: "working" | "error";
    message?: string;
  }> {
    try {
      const response = await fetch("/api/amadeus/airports/search?keyword=NYC", {
        method: "GET",
      });
      if (response.ok) {
        return {
          status: "working",
          message: "Amadeus API service operational",
        };
      }
      return { status: "error", message: "Amadeus API service not responding" };
    } catch (error) {
      return { status: "error", message: `Amadeus API check failed: ${error}` };
    }
  }

  private async checkSupabase(): Promise<{
    status: "working" | "error";
    message?: string;
  }> {
    try {
      // Check if Supabase client is available
      const { getSafeSupabase } = await import("./supabaseSafe");
      const { supabaseHelpers } = await getSafeSupabase();

      // Try a simple operation
      const { data, error } = await supabaseHelpers.getAirports();
      if (!error && data) {
        return {
          status: "working",
          message: `Supabase operational (${data.length} airports loaded)`,
        };
      }
      return { status: "error", message: "Supabase connection issues" };
    } catch (error) {
      return { status: "error", message: `Supabase check failed: ${error}` };
    }
  }

  private async checkService(
    serviceName: string,
    checkFunction: () => Promise<{
      status: "working" | "error";
      message?: string;
    }>,
  ) {
    try {
      const result = await checkFunction();
      this.updateServiceStatus(serviceName, result.status, result.message);
    } catch (error) {
      this.updateServiceStatus(serviceName, "error", `Check failed: ${error}`);
    }
  }

  private updateServiceStatus(
    name: string,
    status: "working" | "error" | "unknown",
    message?: string,
  ) {
    this.services.set(name, {
      name,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private startLogging() {
    // Log service status every 10 minutes to minimize performance impact
    this.logInterval = setInterval(() => {
      // Only log if tab is visible to reduce background processing
      if (document.visibilityState === 'visible') {
        this.logServiceStatus();
      }
    }, 600000);

    // Log after initial services are checked (delayed longer)
    setTimeout(() => this.logServiceStatus(), 8000);
  }

  public logServiceStatus() {
    console.group("🔧 Service Status Report");
    console.log(`Report generated at: ${new Date().toLocaleString()}`);
    console.log("-----------------------------------");

    const serviceList = Array.from(this.services.values());

    if (serviceList.length === 0) {
      console.log("⏳ Services still being checked...");
    } else {
      serviceList.forEach((service) => {
        const emoji =
          service.status === "working"
            ? "✅"
            : service.status === "error"
              ? "❌"
              : "⚠️";
        const timeAgo = this.getTimeAgo(service.timestamp);

        console.log(
          `${emoji} ${service.name}: ${service.status.toUpperCase()} (${timeAgo})`,
        );
        if (service.message) {
          console.log(`   └─ ${service.message}`);
        }
      });

      // Summary
      const working = serviceList.filter((s) => s.status === "working").length;
      const errors = serviceList.filter((s) => s.status === "error").length;
      const total = serviceList.length;

      console.log("-----------------------------------");
      console.log(
        `📊 Summary: ${working}/${total} services working, ${errors} errors`,
      );

      if (errors > 0) {
        console.warn(
          "⚠️ Some services have issues. Check error messages above.",
        );
      } else {
        console.log("🎉 All services are operational!");
      }
    }

    console.groupEnd();
  }

  private getTimeAgo(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return `${Math.floor(diffSecs / 3600)}h ago`;
  }

  public getServiceStatus(serviceName: string): ServiceStatus | undefined {
    return this.services.get(serviceName);
  }

  public getAllServices(): ServiceStatus[] {
    return Array.from(this.services.values());
  }

  public recheckServices() {
    console.log("🔄 Rechecking all services...");
    this.checkInitialServices();
  }

  public stop() {
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = null;
    }
  }
}

// Create global instance
const serviceLogger = new ServiceLogger();

// Make it available globally for debugging
if (typeof window !== "undefined") {
  (window as any).serviceLogger = serviceLogger;

  // Add convenient global functions
  (window as any).checkServices = () => serviceLogger.recheckServices();
  (window as any).serviceStatus = () => serviceLogger.logServiceStatus();
}

export default serviceLogger;