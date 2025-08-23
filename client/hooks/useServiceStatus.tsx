import { useState } from 'react';

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
 * Simplified service status hook (monitoring removed to prevent performance issues)
 */
export function useServiceStatus(options: ServiceStatusHookOptions = {}): ServiceStatusHookReturn {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const handleServiceCheck = async (): Promise<void> => {
    setIsChecking(true);
    try {
      // Service monitoring disabled
      setLastCheckTime(new Date());
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