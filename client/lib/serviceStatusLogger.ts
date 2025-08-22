
interface ServiceStatus {
  name: string;
  status: 'working' | 'error' | 'not_configured';
  message: string;
  lastChecked?: string;
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
  private periodicInterval: NodeJS.Timeout | null = null;

  async checkAndLogServices(): Promise<void> {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data: ServiceCheckResult = await response.json();
        this.logServicesStatus(data);
        this.lastCheckTime = new Date();
      } else {
        console.error('Failed to fetch service status:', response.status);
      }
    } catch (error) {
      console.error('Service status check failed:', error);
    }
  }

  private logServicesStatus(data: ServiceCheckResult): void {
    console.log('%c🔧 Service Status Report', 'color: #3B82F6; font-size: 14px; font-weight: bold;');
    console.log(`📊 Summary: ${data.summary.working}/${data.summary.total} services working, ${data.summary.error} errors`);
    console.log(`Report generated at: ${new Date().toLocaleString()}`);
    console.log('-----------------------------------');

    Object.entries(data.services).forEach(([key, service]) => {
      const icon = service.status === 'working' ? '✅' : service.status === 'error' ? '❌' : '⚠️';
      const status = service.status.toUpperCase();
      console.log(`${icon} ${service.name}: ${status} (${this.getTimeAgo(service.lastChecked)})`);
      console.log(`   └─ ${service.message}`);
    });

    console.log(`📊 Summary: ${data.summary.working}/${data.summary.total} services working, ${data.summary.error} errors`);
    
    if (data.summary.error > 0) {
      console.warn('⚠️ Some services have issues. Check error messages above.');
    }
  }

  private getTimeAgo(timestamp?: string): string {
    if (!timestamp) return 'unknown';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1m ago';
    return `${diffMins}m ago`;
  }

  startPeriodicChecking(intervalMinutes: number = 10): void {
    if (this.periodicInterval) {
      clearInterval(this.periodicInterval);
    }
    
    this.periodicInterval = setInterval(() => {
      this.checkAndLogServices();
    }, intervalMinutes * 60 * 1000);
  }

  getLastCheckTime(): Date | null {
    return this.lastCheckTime;
  }

  manualCheck(): Promise<void> {
    return this.checkAndLogServices();
  }
}

const serviceStatusLogger = new ServiceStatusLogger();
export default serviceStatusLogger;
