import { supabase } from './supabaseServer';

export class DatabaseInitializer {
  private static initialized = false;
  
  /**
   * Initialize the database with required schema and data
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      console.log('🔄 Initializing database...');
      
      // Test basic connection first
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .limit(1);

      if (testError) {
        console.log('❌ Database connection failed:', testError.message);
        return false;
      }

      console.log('✅ Database connection successful');

      // Check if airports table exists and has data
      const { data: airportsData, error: airportsError } = await supabase
        .from('airports')
        .select('*', { count: 'exact' });

      if (airportsError) {
        console.log('⚠️ Airports table not found, it may need to be created');
      } else {
        const airportCount = airportsData?.[0]?.count || 0;
        console.log(`📊 Found ${airportCount} airports in database`);
        
        if (airportCount === 0) {
          await this.seedAirports();
        }
      }

      // Try to create admin user if it doesn't exist
      await this.ensureAdminUser();

      // Try to create guest user if it doesn't exist
      await this.ensureGuestUser();

      this.initialized = true;
      console.log('✅ Database initialization complete');
      return true;

    } catch (error) {
      console.log('❌ Database initialization failed:', error);
      return false;
    }
  }

  /**
   * Seed airports data
   */
  private static async seedAirports(): Promise<void> {
    console.log('🌍 Seeding airports data...');
    
    const airports = [
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
      { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom' },
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
      { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
      { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
      { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
      { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
      { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
      { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
      { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
      { code: 'ORD', name: 'Chicago O\'Hare International Airport', city: 'Chicago', country: 'United States' },
      { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States' },
      { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States' },
      { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States' },
      { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
      { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States' },
      { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States' },
      { code: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States' },
      { code: 'ORY', name: 'Paris Orly Airport', city: 'Paris', country: 'France' },
      { code: 'RFD', name: 'Chicago Rockford International Airport', city: 'Chicago', country: 'United States' }
    ];

    try {
      const { error } = await supabase
        .from('airports')
        .upsert(airports, { onConflict: 'code' });

      if (error) {
        console.log('⚠️ Error seeding airports:', error.message);
      } else {
        console.log(`✅ Successfully seeded ${airports.length} airports`);
      }
    } catch (error) {
      console.log('⚠️ Failed to seed airports:', error);
    }
  }

  /**
   * Ensure admin user exists
   */
  private static async ensureAdminUser(): Promise<void> {
    console.log('👤 Checking for admin user...');
    
    try {
      const adminEmail = 'onboard@admin.com';
      
      // Check if admin user exists in the users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.log('⚠️ Error checking for admin user:', userError.message);
        return;
      }

      if (existingUser) {
        console.log('✅ Admin user already exists in database');
        return;
      }

      // Try to create user in auth first
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'onboardadmin',
        user_metadata: {
          first_name: 'Admin',
          last_name: 'User',
          title: 'Mr'
        },
        email_confirm: true
      });

      if (authError) {
        console.log('⚠️ Could not create auth user:', authError.message);
        // Continue anyway - we might be able to create the user record
      }

      // Create user record in database
      const userId = authUser?.user?.id || 'admin-fallback-id';
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: adminEmail,
          first_name: 'Admin',
          last_name: 'User',
          title: 'Mr'
        });

      if (insertError) {
        console.log('⚠️ Could not create user record:', insertError.message);
      } else {
        console.log('✅ Admin user created successfully');
      }

    } catch (error) {
      console.log('⚠️ Error ensuring admin user:', error);
    }
  }

  /**
   * Check if database is properly initialized
   */
  static async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        return {
          healthy: false,
          message: `Database error: ${error.message}`
        };
      }

      return {
        healthy: true,
        message: 'Database is healthy'
      };

    } catch (error) {
      return {
        healthy: false,
        message: `Connection failed: ${error}`
      };
    }
  }
}
