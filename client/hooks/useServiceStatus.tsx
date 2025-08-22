
import { useEffect, useState } from 'react';
import { serviceStatusLogger } from '../lib/serviceStatusLogger';

interface ServiceStatusHookOptions {
  enablePeriodicChecking?: boolean;
  checkIntervalMinutes?: number;
  checkOnMount?: boolean;
}

interface ServiceStatusHookReturn {
  isChecking: boolean;
  lastCheckTime: Date | null;
  manualCheck: () => Promise<void>;
}

/**
 * React hook for monitoring and logging external services status
 */
export function useServiceStatus(options: ServiceStatusHookOptions = {}): ServiceStatusHookReturn {
  const {
    enablePeriodicChecking = true,
    checkIntervalMinutes = 10,
    checkOnMount = true,
  } = options;

  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  useEffect(() => {
    if (checkOnMount) {
      // Initial check on mount
      handleServiceCheck();
    }

    if (enablePeriodicChecking) {
      // Start periodic checking
      serviceStatusLogger.startPeriodicChecking(checkIntervalMinutes);
    }

    // Log startup information
    console.log('%c🚀 OnboardTicket Service Monitor Started', 'color: #3B82F6; font-size: 14px; font-weight: bold;');
    console.log('Use serviceStatusLogger.manualCheck() to trigger manual checks');

    return () => {
      // Cleanup if needed
    };
  }, [enablePeriodicChecking, checkIntervalMinutes, checkOnMount]);

  const handleServiceCheck = async (): Promise<void> => {
    setIsChecking(true);
    try {
      await serviceStatusLogger.checkAndLogServices();
      setLastCheckTime(serviceStatusLogger.getLastCheckTime());
    } catch (error) {
      console.error('Service check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isChecking,
    lastCheckTime,
    manualCheck: handleServiceCheck,
  };
}
