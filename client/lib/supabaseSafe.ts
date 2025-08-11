// Safe Supabase wrapper that prevents fetch errors in production

let supabaseClient: any = null;
let supabaseHelpers: any = null;

// Safely import Supabase only when needed and configured
const getSafeSupabase = async () => {
  if (supabaseClient) {
    return { supabase: supabaseClient, supabaseHelpers };
  }

  try {
    // Check if we should initialize Supabase
    const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    const isDev = import.meta.env.DEV;
    
    if (!isConfigured && !isDev) {
      // Return mock implementation for production
      supabaseClient = createMockClient();
      supabaseHelpers = createMockHelpers();
      return { supabase: supabaseClient, supabaseHelpers };
    }

    // Dynamically import to avoid module-level execution
    const supabaseModule = await import('./supabaseClient');
    supabaseClient = supabaseModule.supabase;
    supabaseHelpers = supabaseModule.supabaseHelpers;
    
    return { supabase: supabaseClient, supabaseHelpers };
  } catch (error) {
    console.error('Failed to initialize Supabase safely:', error);
    
    // Always provide mock fallback
    supabaseClient = createMockClient();
    supabaseHelpers = createMockHelpers();
    return { supabase: supabaseClient, supabaseHelpers };
  }
};

// Mock Supabase client
const createMockClient = () => ({
  auth: {
    signUp: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') })
  },
  from: () => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
      })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
        })
      })
    })
  }),
  rpc: async () => ({ data: null, error: new Error('Supabase not configured') })
});

// Mock Supabase helpers
const createMockHelpers = () => ({
  async signUp() {
    return { data: { user: null }, error: new Error('Supabase not configured') };
  },
  async signIn() {
    return { data: { user: null }, error: new Error('Supabase not configured') };
  },
  async signOut() {
    return { error: null };
  },
  async getCurrentUser() {
    return null;
  },
  async isAdmin() {
    return false;
  },
  async getUserRole() {
    return 'user';
  },
  async getAirports() {
    // Try fallback API
    try {
      const response = await fetch('/api/airports');
      const data = await response.json();
      return { data: data.data || [], error: data.error };
    } catch (error) {
      return { data: [], error };
    }
  }
});

export { getSafeSupabase };
