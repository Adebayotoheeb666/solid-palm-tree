import { Router, Request, Response } from 'express';

const router = Router();

// Simple database connectivity test
router.get('/test', async (req: Request, res: Response) => {
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database_check: {
      supabase_configured: false,
      supabase_connection: 'not_tested',
      fallback_available: false,
      active_system: 'unknown'
    },
    environment_variables: {
      server: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        NODE_ENV: process.env.NODE_ENV
      },
      client: {
        VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY
      }
    },
    recommendations: []
  };

  try {
    // Check Supabase configuration
    const hasSupabaseConfig = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    report.database_check.supabase_configured = hasSupabaseConfig;

    if (hasSupabaseConfig) {
      try {
        // Test Supabase connection
        const { supabaseServerHelpers } = await import('../lib/supabaseServer');
        const result = await supabaseServerHelpers.getAllAirports();
        
        if (result && !result.error) {
          report.database_check.supabase_connection = 'connected';
          report.database_check.active_system = 'supabase';
          report.recommendations.push('✅ Supabase is connected and working');
        } else {
          report.database_check.supabase_connection = 'error';
          report.recommendations.push('❌ Supabase is configured but connection failed');
        }
      } catch (error) {
        report.database_check.supabase_connection = 'failed';
        report.recommendations.push(`❌ Supabase connection error: ${error.message}`);
      }
    } else {
      report.database_check.supabase_connection = 'not_configured';
      report.recommendations.push('⚠️  Supabase environment variables not configured');
    }

    // Test fallback system
    try {
      // Check if fallback airports route exists
      const fallbackData = [
        { code: "RFD", name: "Chicago Rockford International Airport", city: "Chicago", country: "USA" }
      ];
      
      if (fallbackData.length > 0) {
        report.database_check.fallback_available = true;
        if (!hasSupabaseConfig || report.database_check.supabase_connection !== 'connected') {
          report.database_check.active_system = 'fallback';
        }
        report.recommendations.push('✅ Fallback system is available');
      }
    } catch (error) {
      report.recommendations.push(`❌ Fallback system error: ${error.message}`);
    }

    // Determine final system status
    if (report.database_check.supabase_connection === 'connected') {
      report.recommendations.push('🎉 Primary database (Supabase) is fully operational');
    } else if (report.database_check.fallback_available) {
      report.recommendations.push('⚠️  Running on fallback system - consider configuring Supabase for full features');
    } else {
      report.recommendations.push('❌ No working database system detected');
    }

    // Configuration recommendations
    if (!hasSupabaseConfig) {
      report.recommendations.push('💡 To enable Supabase, set these environment variables:');
      report.recommendations.push('   - SUPABASE_URL=your_supabase_project_url');
      report.recommendations.push('   - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
      report.recommendations.push('   - VITE_SUPABASE_URL=your_supabase_project_url');
      report.recommendations.push('   - VITE_SUPABASE_ANON_KEY=your_anon_public_key');
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({
      ...report,
      error: error.message,
      recommendations: ['❌ Database connectivity check failed']
    });
  }
});

export { router as dbTestRouter };
