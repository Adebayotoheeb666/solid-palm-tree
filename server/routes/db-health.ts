import { Router, Request, Response } from 'express';

const router = Router();

interface DatabaseStatus {
  connected: boolean;
  type: string;
  details: any;
  error?: string;
  responseTime?: number;
}

interface HealthCheckResult {
  timestamp: string;
  supabase: DatabaseStatus;
  fallbackData: DatabaseStatus;
  overall: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    activeDatabase: string;
    recommendations: string[];
  };
}

// Check Supabase connection
async function checkSupabaseConnection(): Promise<DatabaseStatus> {
  const startTime = Date.now();
  
  try {
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        connected: false,
        type: 'supabase',
        details: {
          configured: false,
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseKey,
          environment: process.env.NODE_ENV
        },
        error: 'Supabase environment variables not configured'
      };
    }

    // Try to import and test Supabase
    const { supabaseServerHelpers } = await import('../lib/supabaseServer');
    
    // Test basic connectivity with a simple query
    const result = await supabaseServerHelpers.getAllAirports();
    const responseTime = Date.now() - startTime;
    
    if (result && !result.error) {
      return {
        connected: true,
        type: 'supabase',
        responseTime,
        details: {
          configured: true,
          tablesAccessible: true,
          recordCount: result.data?.length || 0,
          url: supabaseUrl.substring(0, 30) + '...',
          environment: process.env.NODE_ENV
        }
      };
    } else {
      return {
        connected: false,
        type: 'supabase',
        responseTime,
        details: {
          configured: true,
          error: result?.error?.message || 'Unknown error'
        },
        error: result?.error?.message || 'Failed to query Supabase'
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      connected: false,
      type: 'supabase',
      responseTime,
      details: {
        configured: true,
        errorType: error.constructor.name,
        errorMessage: error.message
      },
      error: error.message
    };
  }
}

// Check fallback data availability
async function checkFallbackData(): Promise<DatabaseStatus> {
  const startTime = Date.now();
  
  try {
    // Test fallback airports endpoint
    const response = await fetch('http://localhost:8080/api/airports');
    const data = await response.json();
    const responseTime = Date.now() - startTime;
    
    if (response.ok && data.data && data.data.length > 0) {
      return {
        connected: true,
        type: 'fallback',
        responseTime,
        details: {
          endpointAvailable: true,
          recordCount: data.data.length,
          sampleRecord: data.data[0]
        }
      };
    } else {
      return {
        connected: false,
        type: 'fallback',
        responseTime,
        details: {
          endpointAvailable: response.ok,
          responseStatus: response.status,
          responseData: data
        },
        error: 'Fallback API returned invalid data'
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      connected: false,
      type: 'fallback',
      responseTime,
      details: {
        errorType: error.constructor.name,
        errorMessage: error.message
      },
      error: error.message
    };
  }
}

// Determine overall health status
function determineOverallHealth(supabase: DatabaseStatus, fallback: DatabaseStatus): HealthCheckResult['overall'] {
  const recommendations: string[] = [];
  
  if (supabase.connected && fallback.connected) {
    return {
      status: 'healthy',
      activeDatabase: 'supabase',
      recommendations: ['System is fully operational with Supabase as primary database and fallback available']
    };
  }
  
  if (supabase.connected && !fallback.connected) {
    recommendations.push('Fallback system is not working - consider fixing for redundancy');
    return {
      status: 'healthy',
      activeDatabase: 'supabase',
      recommendations
    };
  }
  
  if (!supabase.connected && fallback.connected) {
    recommendations.push('Supabase is not connected - running on fallback data');
    recommendations.push('Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
    return {
      status: 'degraded',
      activeDatabase: 'fallback',
      recommendations
    };
  }
  
  recommendations.push('Both Supabase and fallback systems are not working');
  recommendations.push('Check network connectivity and environment configuration');
  recommendations.push('Verify Supabase credentials and service availability');
  
  return {
    status: 'unhealthy',
    activeDatabase: 'none',
    recommendations
  };
}

// GET /api/health/database - Database connectivity check
router.get('/database', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Starting database health check...');
    
    // Run all checks in parallel
    const [supabaseStatus, fallbackStatus] = await Promise.all([
      checkSupabaseConnection(),
      checkFallbackData()
    ]);
    
    const overall = determineOverallHealth(supabaseStatus, fallbackStatus);
    
    const result: HealthCheckResult = {
      timestamp: new Date().toISOString(),
      supabase: supabaseStatus,
      fallbackData: fallbackStatus,
      overall
    };
    
    console.log('📊 Database health check completed:', {
      supabase: supabaseStatus.connected ? '✅' : '❌',
      fallback: fallbackStatus.connected ? '✅' : '❌',
      overall: overall.status
    });
    
    // Return appropriate HTTP status based on overall health
    const statusCode = overall.status === 'healthy' ? 200 : 
                      overall.status === 'degraded' ? 206 : 503;
    
    res.status(statusCode).json(result);
  } catch (error: any) {
    console.error('❌ Database health check failed:', error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error.message
    });
  }
});

// GET /api/health/quick - Quick health check
router.get('/quick', async (req: Request, res: Response) => {
  try {
    const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    res.json({
      timestamp: new Date().toISOString(),
      status: 'online',
      database: {
        configured: useSupabase ? 'supabase' : 'fallback',
        supabaseConfigured: useSupabase,
        environment: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message
    });
  }
});

export { router as dbHealthRouter };
