import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📋 Environment Variables:');
  console.log('  SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('\n❌ Missing required environment variables');
    return false;
  }
  
  // Validate URL format
  try {
    new URL(supabaseUrl);
    console.log('  URL Format: ✅ Valid');
  } catch (error) {
    console.log('  URL Format: ❌ Invalid -', error.message);
    return false;
  }
  
  // Test connection
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('\n🔗 Testing Database Connection...');
    
    // Test basic query
    const { data, error } = await supabase
      .from('airports')
      .select('count(*)', { count: 'exact' });
    
    if (error) {
      console.log('❌ Database Connection Failed:', error.message);
      return false;
    }
    
    console.log('✅ Database Connection Successful');
    console.log(`📊 Airports in database: ${data?.[0]?.count || 0}`);
    
    // Test auth
    console.log('\n🔐 Testing Authentication...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth Test Failed:', authError.message);
    } else {
      console.log('✅ Auth Connection Successful');
      console.log(`👥 Users in auth: ${authData.users?.length || 0}`);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Connection Test Failed:', error.message);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Supabase connection is working properly!');
      process.exit(0);
    } else {
      console.log('\n💥 Supabase connection failed. Please check your configuration.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
