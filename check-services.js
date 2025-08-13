#!/usr/bin/env node

// Comprehensive service status checker
async function checkServices() {
  try {
    const response = await fetch('http://localhost:8080/api/services');
    const data = await response.json();
    
    console.log('\n🔍 SERVICE STATUS REPORT\n');
    console.log('='.repeat(50));
    
    const { services, summary } = data;
    
    // Check each service
    Object.entries(services).forEach(([key, service]) => {
      const status = service.configured 
        ? (service.status === 'working' ? '✅' : '❌') 
        : '⚠️';
      
      console.log(`\n${status} ${service.name}`);
      console.log(`   Status: ${service.status}`);
      console.log(`   Configured: ${service.configured ? 'Yes' : 'No'}`);
      console.log(`   Message: ${service.message}`);
      
      if (service.details) {
        console.log(`   Details:`, service.details);
      }
      
      if (service.features) {
        console.log(`   Features: ${service.features.join(', ')}`);
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`   Total services: ${summary.total}`);
    console.log(`   Configured: ${summary.configured}/${summary.total}`);
    console.log(`   Working: ${summary.working}/${summary.total}`);
    
    // Overall health
    const healthScore = summary.working / summary.total;
    let overallHealth = '';
    if (healthScore === 1) {
      overallHealth = '🟢 All systems operational';
    } else if (healthScore >= 0.7) {
      overallHealth = '🟡 Most systems working';
    } else {
      overallHealth = '🔴 Multiple issues detected';
    }
    
    console.log(`   Overall: ${overallHealth}`);
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Failed to check services:', error.message);
  }
}

checkServices();
