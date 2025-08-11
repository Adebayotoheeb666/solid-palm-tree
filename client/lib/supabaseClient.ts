import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Check if Supabase should be initialized
const shouldInitializeSupabase = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
         import.meta.env.DEV
}

// Production/Development configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Create mock client for production when Supabase is not configured
const createMockSupabaseClient = () => ({
  auth: {
    signUp: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') })
  },
  from: () => ({
    select: () => ({ order: () => ({ data: [], error: null }) }),
    insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) })
  }),
  rpc: async () => ({ data: null, error: new Error('Supabase not configured') })
})

// Create Supabase client or mock client
export const supabase: SupabaseClient<any> = shouldInitializeSupabase()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Disable auth session persistence since we use custom auth
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'X-Client-Info': 'onboard-ticket-client'
        }
      }
    })
  : createMockSupabaseClient() as any

// Database helper types that match our migration schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          title: 'Mr' | 'Ms' | 'Mrs'
          status: 'active' | 'suspended' | 'banned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          title?: 'Mr' | 'Ms' | 'Mrs'
          status?: 'active' | 'suspended' | 'banned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          title?: 'Mr' | 'Ms' | 'Mrs'
          status?: 'active' | 'suspended' | 'banned'
          created_at?: string
          updated_at?: string
        }
      }
      airports: {
        Row: {
          id: string
          code: string
          name: string
          city: string
          country: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          city: string
          country: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          city?: string
          country?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          pnr: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'expired'
          from_airport_id: string
          to_airport_id: string
          departure_date: string
          return_date: string | null
          trip_type: 'oneway' | 'roundtrip'
          total_amount: number
          currency: string
          contact_email: string
          terms_accepted: boolean
          ticket_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pnr?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'expired'
          from_airport_id: string
          to_airport_id: string
          departure_date: string
          return_date?: string | null
          trip_type?: 'oneway' | 'roundtrip'
          total_amount: number
          currency?: string
          contact_email: string
          terms_accepted?: boolean
          ticket_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pnr?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'expired'
          from_airport_id?: string
          to_airport_id?: string
          departure_date?: string
          return_date?: string | null
          trip_type?: 'oneway' | 'roundtrip'
          total_amount?: number
          currency?: string
          contact_email?: string
          terms_accepted?: boolean
          ticket_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      passengers: {
        Row: {
          id: string
          booking_id: string
          title: 'Mr' | 'Ms' | 'Mrs'
          first_name: string
          last_name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          title: 'Mr' | 'Ms' | 'Mrs'
          first_name: string
          last_name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          title?: 'Mr' | 'Ms' | 'Mrs'
          first_name?: string
          last_name?: string
          email?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          amount: number
          currency: string
          payment_method: 'card' | 'paypal'
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_id: string | null
          paypal_order_id: string | null
          paypal_payer_id: string | null
          payment_details: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          amount: number
          currency?: string
          payment_method: 'card' | 'paypal'
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_id?: string | null
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          payment_details?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_method?: 'card' | 'paypal'
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_id?: string | null
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          payment_details?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          message: string
          category: string
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          admin_response: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          message: string
          category: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          admin_response?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          message?: string
          category?: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          admin_response?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      booking_summary: {
        Row: {
          id: string
          pnr: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'expired'
          trip_type: 'oneway' | 'roundtrip'
          departure_date: string
          return_date: string | null
          total_amount: number
          currency: string
          created_at: string
          customer_name: string
          customer_email: string
          from_code: string
          from_city: string
          from_country: string
          to_code: string
          to_city: string
          to_country: string
          passenger_count: number
        }
      }
      admin_dashboard_stats: {
        Row: {
          active_users: number
          total_bookings: number
          confirmed_bookings: number
          pending_bookings: number
          cancelled_bookings: number
          total_revenue: number
          open_tickets: number
          active_tickets: number
          completed_payments: number
          pending_payments: number
        }
      }
      popular_routes: {
        Row: {
          from_code: string
          from_city: string
          to_code: string
          to_city: string
          booking_count: number
          total_revenue: number
          avg_amount: number
        }
      }
    }
    Functions: {
      is_admin: {
        Args: {}
        Returns: boolean
      }
      get_user_role: {
        Args: {}
        Returns: string
      }
      create_admin_user: {
        Args: {
          admin_email: string
        }
        Returns: string
      }
      cleanup_expired_bookings: {
        Args: {}
        Returns: number
      }
    }
  }
}

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

// Wrapper for Supabase operations with error handling
const withErrorHandling = async <T>(operation: () => Promise<T>, fallback?: T): Promise<T | null> => {
  // Always return fallback in production if Supabase not configured
  if (!shouldInitializeSupabase()) {
    console.warn('Supabase not configured, using fallback')
    return fallback || null
  }

  try {
    const result = await operation()
    return result
  } catch (error) {
    console.error('Supabase operation failed:', error)

    // Don't re-throw in production to prevent crashes
    if (import.meta.env.PROD) {
      return fallback || null
    }

    // In development, log but still return fallback to prevent crashes
    console.warn('Using fallback due to Supabase error in development')
    return fallback || null
  }
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Auth helpers
  async signUp(email: string, password: string, metadata: any) {
    return await withErrorHandling(() =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      }),
      { data: { user: null }, error: new Error('Supabase not configured') }
    )
  },

  async signIn(email: string, password: string) {
    return await withErrorHandling(() =>
      supabase.auth.signInWithPassword({
        email,
        password
      }),
      { data: { user: null }, error: new Error('Supabase not configured') }
    )
  },

  async signOut() {
    return await withErrorHandling(() => supabase.auth.signOut())
  },

  async getCurrentUser() {
    const result = await withErrorHandling(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    })
    return result
  },

  // Check if current user is admin
  async isAdmin() {
    const result = await withErrorHandling(async () => {
      const { data, error } = await supabase.rpc('is_admin')
      return data === true && !error
    }, false)
    return result || false
  },

  // Get user role
  async getUserRole() {
    const result = await withErrorHandling(async () => {
      const { data, error } = await supabase.rpc('get_user_role')
      return error ? 'user' : data
    }, 'user')
    return result || 'user'
  },

  // Booking helpers
  async getAirports() {
    // Try Supabase first
    const result = await withErrorHandling(() =>
      supabase
        .from('airports')
        .select('*')
        .order('city'),
      null
    )

    if (result && result.data && result.data.length > 0) {
      return result
    }

    // Fallback to API endpoint
    try {
      const response = await fetch('/api/airports')
      const data = await response.json()
      return { data: data.data || [], error: data.error }
    } catch (error) {
      console.error('Failed to fetch airports from fallback API:', error)
      return { data: [], error: error }
    }
  },

  async getUserBookings(userId: string) {
    return await supabase
      .from('booking_summary')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  async createBooking(bookingData: Database['public']['Tables']['bookings']['Insert']) {
    return await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()
  },

  // Admin helpers
  async getAdminStats() {
    return await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single()
  },

  async getAllBookings(page = 1, limit = 10, status?: string) {
    let query = supabase
      .from('booking_summary')
      .select('*', { count: 'exact' })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    return await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
  },

  async updateBookingStatus(bookingId: string, status: string) {
    return await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
  }
}
