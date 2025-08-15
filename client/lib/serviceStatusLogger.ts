/**
 * Client-side service status logger
 * Logs the status of external services to browser console
 */

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
  private static instance: ServiceStatusLogger;
  private isLogging = false;
  private lastCheck: Date | null = null;

  private constructor() {}

  static getInstance(): ServiceStatusLogger {
    if (!ServiceStatusLogger.instance) {
      ServiceStatusLogger.instance = new ServiceStatusLogger();
    }
    return ServiceStatusLogger.instance;
  }

  /**
   * Check and log all external services status
   */
  async checkAndLogServices(): Promise<void> {
    if (this.isLogging) return;

    this.isLogging = true;
    const startTime = performance.now();

    try {
      const isFirstCheck = this.lastCheck === null;

      if (isFirstCheck) {
        this.logWelcomeMessage();
      }

      console.group(`🔍 OnboardTicket Services Status Check ${isFirstCheck ? '(Initial)' : '(Periodic)'}`);
      console.log('⏰ Check initiated at:', new Date().toLocaleString());

      const result = await this.fetchServicesStatus();

      if (result) {
        this.logServicesStatus(result);
        this.logSummary(result);
        this.lastCheck = new Date();

        if (isFirstCheck) {
          this.logUsageInstructions();
        }
      } else {
        console.error('❌ Failed to fetch services status');
      }

      const endTime = performance.now();
      console.log(`⚡ Check completed in ${Math.round(endTime - startTime)}ms`);
      console.groupEnd();

    } catch (error) {
      console.error('❌ Service status check failed:', error);
      console.groupEnd();
    } finally {
      this.isLogging = false;
    }
  }

  /**
   * Fetch services status from API
   */
  private async fetchServicesStatus(): Promise<ServiceCheckResult | null> {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('🚨 Failed to fetch services status:', error);
      return null;
    }
  }

  /**
   * Log individual service statuses
   */
  private logServicesStatus(result: ServiceCheckResult): void {
    console.group('📋 Individual Services Status');
    
    Object.entries(result.services).forEach(([serviceName, status]) => {
      const emoji = this.getStatusEmoji(status.status);
      const style = this.getStatusStyle(status.status);
      
      console.log(
        `%c${emoji} ${serviceName.toUpperCase()}`,
        style,
        status.message
      );

      if (status.lastChecked) {
        console.log(`   └─ Last checked: ${status.lastChecked}`);
      }
    });
    
    console.groupEnd();
  }

  /**
   * Log services summary
   */
  private logSummary(result: ServiceCheckResult): void {
    const { summary } = result;
    
    console.group('📊 Services Summary');
    console.log(`✅ Working: ${summary.working}/${summary.total}`);
    console.log(`❌ Error: ${summary.error}/${summary.total}`);
    console.log(`⚙️ Not configured: ${summary.not_configured}/${summary.total}`);
    
    if (summary.working === summary.total) {
      console.log('%c🎉 All services are operational!', 'color: #10B981; font-weight: bold;');
    } else if (summary.error > 0) {
      console.warn(`⚠️ ${summary.error} service(s) have errors`);
    }
    
    console.groupEnd();
  }

  /**
   * Get emoji for service status
   */
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'working': return '✅';
      case 'error': return '❌';
      case 'not_configured': return '⚙️';
      default: return '❓';
    }
  }

  /**
   * Get console style for service status
   */
  private getStatusStyle(status: string): string {
    switch (status) {
      case 'working': 
        return 'color: #10B981; font-weight: bold;';
      case 'error': 
        return 'color: #EF4444; font-weight: bold;';
      case 'not_configured': 
        return 'color: #F59E0B; font-weight: bold;';
      default: 
        return 'color: #6B7280; font-weight: bold;';
    }
  }

  /**
   * Start periodic status checking
   */
  startPeriodicChecking(intervalMinutes: number = 10): void {
    // Initial check
    this.checkAndLogServices();

    // Periodic checks
    setInterval(() => {
      this.checkAndLogServices();
    }, intervalMinutes * 60 * 1000);

    console.log(`🔄 Periodic service status checking enabled (every ${intervalMinutes} minutes)`);
  }

  /**
   * Log welcome message with service information
   */
  private logWelcomeMessage(): void {
    console.log(
      '%c🚀 OnboardTicket External Services Monitor',
      'color: #3B82F6; font-size: 16px; font-weight: bold; text-decoration: underline;'
    );
    console.log('%cMonitoring the following external services:', 'color: #6B7280; font-style: italic;');
    console.log('  • 🔐 Supabase (Database & Authentication)');
    console.log('  • 💳 Stripe (Payment Processing)');
    console.log('  • ✈️ Amadeus (Flight Data API)');
    console.log('  • 📧 SendGrid (Email Service)');
    console.log('');
  }

  /**
   * Log usage instructions for developers
   */
  private logUsageInstructions(): void {
    console.group('%c💡 Developer Tools', 'color: #8B5CF6; font-weight: bold;');
    console.log('%cUse these commands in the console:', 'color: #6B7280;');
    console.log('%cserviceStatusLogger.manualCheck()%c - Trigger manual status check', 'background: #F3F4F6; padding: 2px 4px; border-radius: 3px;', '');
    console.log('%cserviceStatusLogger.getLastCheckTime()%c - Get last check timestamp', 'background: #F3F4F6; padding: 2px 4px; border-radius: 3px;', '');
    console.log('Automatic checks run every 10 minutes while the app is active');
    console.groupEnd();
  }

  /**
   * Get last check time
   */
  getLastCheckTime(): Date | null {
    return this.lastCheck;
  }

  /**
   * Manual trigger for service check (for debugging)
   */
  async manualCheck(): Promise<void> {
    await this.checkAndLogServices();
  }
}

// Export singleton instance
export const serviceStatusLogger = ServiceStatusLogger.getInstance();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).serviceStatusLogger = serviceStatusLogger;
}
