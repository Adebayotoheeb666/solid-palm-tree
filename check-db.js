#!/usr/bin/env node

async function checkDatabaseConnectivity() {
  console.log("🔍 OnboardTicket Database Connectivity Check");
  console.log("=".repeat(50));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch("http://localhost:8080/api/health/database", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const result = await response.json();

    console.log(`📊 Check completed at: ${result.timestamp}`);
    console.log(`🌐 HTTP Status: ${response.status} ${response.statusText}`);
    console.log("");

    // Supabase Status
    console.log("🗄️  SUPABASE DATABASE:");
    console.log(
      `   Status: ${result.supabase.connected ? "✅ Connected" : "❌ Disconnected"}`,
    );
    console.log(`   Type: ${result.supabase.type}`);
    if (result.supabase.responseTime) {
      console.log(`   Response Time: ${result.supabase.responseTime}ms`);
    }
    if (result.supabase.error) {
      console.log(`   Error: ${result.supabase.error}`);
    }
    console.log(
      `   Details:`,
      JSON.stringify(result.supabase.details, null, 4),
    );
    console.log("");

    // Fallback Status
    console.log("🔄 FALLBACK SYSTEM:");
    console.log(
      `   Status: ${result.fallbackData.connected ? "✅ Available" : "❌ Unavailable"}`,
    );
    console.log(`   Type: ${result.fallbackData.type}`);
    if (result.fallbackData.responseTime) {
      console.log(`   Response Time: ${result.fallbackData.responseTime}ms`);
    }
    if (result.fallbackData.error) {
      console.log(`   Error: ${result.fallbackData.error}`);
    }
    console.log(
      `   Details:`,
      JSON.stringify(result.fallbackData.details, null, 4),
    );
    console.log("");

    // Overall Status
    console.log("📈 OVERALL SYSTEM HEALTH:");
    const statusEmoji =
      result.overall.status === "healthy"
        ? "✅"
        : result.overall.status === "degraded"
          ? "⚠️"
          : "❌";
    console.log(
      `   Status: ${statusEmoji} ${result.overall.status.toUpperCase()}`,
    );
    console.log(`   Active Database: ${result.overall.activeDatabase}`);
    console.log("   Recommendations:");
    result.overall.recommendations.forEach((rec) => {
      console.log(`     • ${rec}`);
    });

    console.log("");
    console.log("=".repeat(50));

    if (result.overall.status === "healthy") {
      console.log("🎉 Database connectivity is working perfectly!");
      process.exit(0);
    } else if (result.overall.status === "degraded") {
      console.log("⚠️  Database connectivity is degraded but functional");
      process.exit(1);
    } else {
      console.log("❌ Database connectivity has issues that need attention");
      process.exit(2);
    }
  } catch (error) {
    console.error("❌ Failed to check database connectivity:", error.message);
    console.log("");
    console.log("Possible issues:");
    console.log("  • Server is not running on localhost:8080");
    console.log("  • Health check endpoint is not available");
    console.log("  • Network connectivity issues");
    process.exit(3);
  }
}

checkDatabaseConnectivity();
