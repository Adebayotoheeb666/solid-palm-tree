import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../client/lib/supabaseClient";

// Server-side Supabase client with service role key for admin operations
const supabaseUrl =
  process.env.SUPABASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://placeholder.supabase.co"
    : "http://localhost:54321");
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key";

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_URL.includes("placeholder") &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== "placeholder-service-role-key" &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== "your-service-role-key"
  );
};

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Wrapper for server-side Supabase operations with error handling
const withServerErrorHandling = async <T>(
  operation: () => Promise<T>,
  fallback?: T,
): Promise<T | null> => {
  if (!isSupabaseConfigured() && process.env.NODE_ENV === "production") {
    console.warn("Supabase not configured in production environment");
    return fallback || null;
  }

  try {
    return await operation();
  } catch (error) {
    console.error("Server Supabase operation failed:", error);
    if (process.env.NODE_ENV === "development") {
      throw error; // Re-throw in development for debugging
    }
    return fallback || null;
  }
};

// Helper functions for server-side operations
export const supabaseServerHelpers = {
  // User operations
  async createUser(userData: Database["public"]["Tables"]["users"]["Insert"]) {
    return await supabase.from("users").insert(userData).select().single();
  },

  async getUserById(id: string) {
    return await supabase.from("users").select("*").eq("id", id).single();
  },

  async getUserByEmail(email: string) {
    return await supabase.from("users").select("*").eq("email", email).single();
  },

  // Booking operations
  async createBooking(
    bookingData: Database["public"]["Tables"]["bookings"]["Insert"],
  ) {
    return await supabase
      .from("bookings")
      .insert(bookingData)
      .select(
        `
        *,
        from_airport:airports!from_airport_id(*),
        to_airport:airports!to_airport_id(*),
        passengers(*)
      `,
      )
      .single();
  },

  async addPassengers(
    passengers: Database["public"]["Tables"]["passengers"]["Insert"][],
  ) {
    return await supabase.from("passengers").insert(passengers).select();
  },

  async getUserBookings(userId: string) {
    return await supabase
      .from("booking_summary")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  async getBookingById(id: string) {
    return await supabase
      .from("bookings")
      .select(
        `
        *,
        from_airport:airports!from_airport_id(*),
        to_airport:airports!to_airport_id(*),
        passengers(*),
        transactions(*)
      `,
      )
      .eq("id", id)
      .single();
  },

  async updateBookingStatus(
    id: string,
    status: Database["public"]["Tables"]["bookings"]["Row"]["status"],
  ) {
    return await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
  },

  async updateBooking(
    id: string,
    updates: Partial<Database["public"]["Tables"]["bookings"]["Update"]>,
  ) {
    return await supabase
      .from("bookings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
  },

  // Utility method to generate PNR
  generatePNR(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Guest booking operations
  async createGuestBooking(bookingData: {
    from_airport_id: string;
    to_airport_id: string;
    departure_date: string;
    return_date?: string | null;
    trip_type: string;
    total_amount: number;
    contact_email: string;
    contact_phone?: string | null;
    terms_accepted: boolean;
  }) {
    const pnr = this.generatePNR();

    // Get or create a special guest user for guest bookings
    const guestUserId = await this.getOrCreateGuestUser();

    return await supabase
      .from("bookings")
      .insert({
        from_airport_id: bookingData.from_airport_id,
        to_airport_id: bookingData.to_airport_id,
        departure_date: bookingData.departure_date,
        return_date: bookingData.return_date,
        trip_type: bookingData.trip_type,
        total_amount: bookingData.total_amount,
        contact_email: bookingData.contact_email,
        contact_phone: bookingData.contact_phone,
        terms_accepted: bookingData.terms_accepted,
        pnr,
        status: "pending",
        currency: "USD",
        user_id: guestUserId, // Use special guest user
      })
      .select()
      .single();
  },

  async getGuestBookingByPNR(pnr: string, email: string) {
    const guestUserId = await this.getOrCreateGuestUser();
    return await supabase
      .from("bookings")
      .select("*")
      .eq("pnr", pnr)
      .eq("contact_email", email)
      .eq("user_id", guestUserId)
      .single();
  },

  // Helper method to get or create a special guest user
  async getOrCreateGuestUser(): Promise<string> {
    const guestEmail = "guest@onboardticket.system";

    // Try to find existing guest user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", guestEmail)
      .single();

    if (existingUser) {
      return existingUser.id;
    }

    // Create guest user if it doesn't exist
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email: guestEmail,
        first_name: "Guest",
        last_name: "User",
        role: "guest",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !newUser) {
      throw new Error(`Failed to create guest user: ${error?.message}`);
    }

    return newUser.id;
  },

  async getAirportById(id: string) {
    return await supabase.from("airports").select("*").eq("id", id).single();
  },

  async getPassengersByBookingId(bookingId: string) {
    return await supabase
      .from("passengers")
      .select("*")
      .eq("booking_id", bookingId);
  },

  // Airport operations
  async getAllAirports() {
    return await withServerErrorHandling(
      () => supabase.from("airports").select("*").order("city"),
      { data: [], error: null },
    );
  },

  async getAirportByCode(code: string) {
    return await withServerErrorHandling(
      () => supabase.from("airports").select("*").eq("code", code).single(),
      { data: null, error: new Error("Supabase not configured") },
    );
  },

  // Transaction operations
  async createTransaction(
    transactionData: Database["public"]["Tables"]["transactions"]["Insert"],
  ) {
    return await supabase
      .from("transactions")
      .insert(transactionData)
      .select()
      .single();
  },

  async updateTransactionStatus(
    id: string,
    status: Database["public"]["Tables"]["transactions"]["Row"]["status"],
    paymentDetails?: any,
  ) {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (paymentDetails) {
      updateData.payment_details = paymentDetails;
    }

    return await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
  },

  async getUserTransactions(userId: string) {
    return await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  // Support ticket operations
  async createSupportTicket(
    ticketData: Database["public"]["Tables"]["support_tickets"]["Insert"],
  ) {
    return await supabase
      .from("support_tickets")
      .insert(ticketData)
      .select()
      .single();
  },

  async getUserSupportTickets(userId: string) {
    return await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  async updateSupportTicketStatus(
    id: string,
    status: Database["public"]["Tables"]["support_tickets"]["Row"]["status"],
    adminResponse?: string,
  ) {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminResponse) {
      updateData.admin_response = adminResponse;
    }

    if (status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }

    return await supabase
      .from("support_tickets")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
  },

  // Admin operations
  async getAdminStats() {
    return await supabase.from("admin_dashboard_stats").select("*").single();
  },

  async getAllBookingsAdmin(page = 1, limit = 10, status?: string) {
    let query = supabase
      .from("booking_summary")
      .select("*", { count: "exact" });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    return await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
  },

  async getAllTransactionsAdmin() {
    return await supabase
      .from("transactions")
      .select(
        `
        *,
        booking:bookings(pnr, total_amount),
        user:users(first_name, last_name, email)
      `,
      )
      .order("created_at", { ascending: false });
  },

  async getAllSupportTicketsAdmin() {
    return await supabase
      .from("support_tickets")
      .select(
        `
        *,
        user:users(first_name, last_name, email)
      `,
      )
      .order("created_at", { ascending: false });
  },

  // Check if user is admin
  async isUserAdmin(userId: string) {
    const { data, error } = await supabase.rpc(
      "is_admin",
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    return !error && data === true;
  },

  // Utility functions
  async cleanupExpiredBookings() {
    return await supabase.rpc("cleanup_expired_bookings");
  },
};
