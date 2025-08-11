export async function logSupabaseConnection() {
  // Skip Supabase connection check in production if not configured
  if (process.env.NODE_ENV === "production" && !process.env.SUPABASE_URL) {
    console.log(
      "[Supabase] Skipping connection check - not configured in production",
    );
    return;
  }

  try {
    // Dynamically import to avoid loading Supabase if not needed
    const { supabase } = await import("../client/lib/supabaseClient");
    const { error } = await supabase.from("test").select("*").limit(1);
    if (error) {
      console.error("[Supabase] Database connection failed:", error.message);
    } else {
      console.log("[Supabase] Database connection successful.");
    }
  } catch (err) {
    console.error("[Supabase] Database connection error:", err);
  }
}
