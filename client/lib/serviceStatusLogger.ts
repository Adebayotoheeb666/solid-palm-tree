
interface ServiceStatus {
  name: string;
  status: "working" | "error" | "unknown" | "not_configured";
  message?: string;
  timestamp: string;
}

interface ServiceCheckResult {
  services: Record<string, ServiceStatus>;
  summary: {
    working: number;
    error: number;
    not_configured: number;
    total: number;
  };
}

class ServiceStatusLogger {
  private lastCheckTime: Date | null = null;
  
  async checkAndLogServices(): Promise<void> {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: ServiceCheckResult = await response.json();
      this.lastCheckTime = new Date();
      
      console.log('🔍 Service Status Check Complete:', data.summary);
    } catch (error) {
      console.error('❌ Service check failed:', error);
    }
  }
  
  getLastCheckTime(): Date | null {
    return this.lastCheckTime;
  }
  
  startPeriodicChecking(intervalMinutes: number = 10): void {
    // Only start if not already running
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.checkAndLogServices();
      }
    }, intervalMinutes * 60 * 1000);
  }
}

export default new ServiceStatusLogger();
