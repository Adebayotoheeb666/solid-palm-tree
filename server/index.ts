import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Import Supabase authentication routes
import {
  handleSupabaseRegister,
  handleSupabaseLogin,
  handleSupabaseValidateToken,
  supabaseAuthMiddleware,
} from "./routes/supabase-auth";

// Import database initialization
import { DatabaseInitializer } from "./lib/databaseInit";

// Import fallback authentication routes for demo
import {
  handleRegister,
  handleLogin,
  handleValidateToken,
  authenticateUser,
} from "./routes/auth";

// Import hybrid authentication routes
import {
  handleHybridRegister,
  handleHybridLogin,
  handleHybridValidateToken,
  hybridAuthMiddleware,
} from "./routes/hybrid-auth";

// Import user management routes
import {
  handleGetDashboard,
  handleGetBookings,
  handleGetBooking,
  handleUpdateProfile,
} from "./routes/user";

// Import Supabase booking routes
import {
  handleCreateSupabaseBooking,
  handleGetSupabaseUserBookings,
  handleGetSupabaseBooking,
  handleUpdateSupabaseBookingStatus,
  handleCancelSupabaseBooking,
  handleGetAllSupabaseBookings,
} from "./routes/supabase-bookings";

// Import fallback routes
import { fallbackAirportsRouter } from "./routes/fallback-airports";
import { dbHealthRouter } from "./routes/db-health";
import { dbTestRouter } from "./routes/db-test";

// Import fallback booking routes for demo
import {
  handleCreateBooking,
  handleGetUserBookings,
  handleGetBooking as handleGetBookingDetails,
  handleUpdateBookingStatus,
  handleCancelBooking,
  handleGetAllBookings,
} from "./routes/bookings";

// Import payment routes
import {
  handleProcessPayment,
  handleGetPaymentHistory,
  handleGetTransaction,
  handleRefundPayment,
  handleGetAllTransactions,
  handleCreatePayPalOrder,
  handleCapturePayPalPayment,
  handleCreateStripePaymentIntent,
  handleGetStripeConfig,
} from "./routes/payments";

// Import support routes
import {
  handleCreateSupportTicket,
  handleGetUserSupportTickets,
  handleGetSupportTicket,
  handleUpdateSupportTicketStatus,
  handleCloseSupportTicket,
  handleGetAllSupportTickets,
  handleGetSupportStats,
} from "./routes/support";

// Import admin routes
import {
  handleGetAdminStats,
  handleGetAllUsers,
  handleUpdateUserStatus,
} from "./routes/admin";

// Import email service routes
import {
  handleSendBookingConfirmation,
  handleSendPaymentConfirmation,
  handleSendSupportTicketConfirmation,
  handleSendPasswordReset,
  handleSendWelcomeEmail,
  handleTestEmail,
} from "./routes/email";

// Import Amadeus API routes
import {
  handleSearchFlights,
  handleSearchAirports,
  handleGetFlightPrice,
  handleGetSeatMaps,
  handleGetAirline,
  handleGetPopularDestinations,
  handleAmadeusHealthCheck,
} from "./routes/amadeus";

// Import Stripe webhook routes
import {
  handleStripeWebhook,
  handleWebhookHealth,
} from "./routes/stripe-webhooks";

// Import email verification routes
import {
  handleSendVerificationEmail,
  handleVerifyEmail,
  handleCheckVerificationStatus,
  handleResendVerificationEmail,
} from "./routes/email-verification";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());

  // Stripe webhook needs raw body, so add it before express.json()
  app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Database health check
  app.get("/api/health/database", async (req, res) => {
    if (!useSupabase) {
      return res.json({
        healthy: true,
        message: "Using fallback system (no database)",
        system: "fallback"
      });
    }

    const health = await DatabaseInitializer.checkHealth();
    res.status(health.healthy ? 200 : 500).json({
      ...health,
      system: "supabase"
    });
  });

  // Add fallback airports route
  app.use("/api", fallbackAirportsRouter);

  // Add database health check routes
  app.use("/api/health", dbHealthRouter);
  app.use("/api/db", dbTestRouter);

  // Determine if we should use Supabase or fallback routes
  const useSupabase =
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_URL.includes("placeholder") &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== "placeholder-service-role-key" &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== "your-service-role-key";
  const authMiddleware = useSupabase
    ? supabaseAuthMiddleware
    : authenticateUser;

  console.log("🔧 Auth system configuration:");
  console.log("  SUPABASE_URL:", !!process.env.SUPABASE_URL);
  console.log(
    "  SUPABASE_SERVICE_ROLE_KEY:",
    !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  console.log("  useSupabase:", useSupabase);
  console.log("  Auth routes: Using", useSupabase ? "Supabase" : "Fallback");

  // Initialize database if using Supabase
  if (useSupabase) {
    DatabaseInitializer.initialize().then(success => {
      if (success) {
        console.log("✅ Database initialization completed");
      } else {
        console.log("⚠️ Database initialization failed, some features may not work");
      }
    }).catch(error => {
      console.log("❌ Database initialization error:", error);
    });
  }

  // Authentication routes (public)
  if (useSupabase) {
    console.log("📋 Setting up Supabase auth routes");
    app.post("/api/auth/register", handleSupabaseRegister);
    app.post("/api/auth/login", handleSupabaseLogin);
    app.get("/api/auth/validate", handleSupabaseValidateToken);
  } else {
    console.log("📋 Setting up fallback auth routes");
    // Fallback to mock auth for development
    app.post("/api/auth/register", handleRegister);
    app.post("/api/auth/login", handleLogin);
    app.get("/api/auth/validate", handleValidateToken);
  }

  // User management routes (authenticated)
  app.get("/api/user/dashboard", authMiddleware, handleGetDashboard);
  app.get("/api/user/bookings", authMiddleware, handleGetBookings);
  app.get("/api/user/bookings/:bookingId", authMiddleware, handleGetBooking);
  app.put("/api/user/profile", authMiddleware, handleUpdateProfile);

  // Booking routes (authenticated)
  if (useSupabase) {
    app.post("/api/bookings", authMiddleware, handleCreateSupabaseBooking);
    app.get("/api/bookings", authMiddleware, handleGetSupabaseUserBookings);
    app.get(
      "/api/bookings/:bookingId",
      authMiddleware,
      handleGetSupabaseBooking,
    );
    app.put(
      "/api/bookings/:bookingId/cancel",
      authMiddleware,
      handleCancelSupabaseBooking,
    );
  } else {
    // Fallback to mock bookings for development
    app.post("/api/bookings", authMiddleware, handleCreateBooking);
    app.get("/api/bookings", authMiddleware, handleGetUserBookings);
    app.get(
      "/api/bookings/:bookingId",
      authMiddleware,
      handleGetBookingDetails,
    );
    app.put(
      "/api/bookings/:bookingId/cancel",
      authMiddleware,
      handleCancelBooking,
    );
  }

  // Payment routes (authenticated)
  app.post("/api/payments", authenticateUser, handleProcessPayment);
  app.post(
    "/api/payments/paypal/create-order",
    authenticateUser,
    handleCreatePayPalOrder,
  );
  app.post(
    "/api/payments/paypal/capture",
    authenticateUser,
    handleCapturePayPalPayment,
  );
  app.post(
    "/api/payments/stripe/create-intent",
    authenticateUser,
    handleCreateStripePaymentIntent,
  );
  app.get("/api/payments/stripe/config", handleGetStripeConfig);
  app.get("/api/payments/history", authenticateUser, handleGetPaymentHistory);
  app.get(
    "/api/payments/:transactionId",
    authenticateUser,
    handleGetTransaction,
  );

  // Support ticket routes (authenticated)
  app.post("/api/support/tickets", authenticateUser, handleCreateSupportTicket);
  app.get(
    "/api/support/tickets",
    authenticateUser,
    handleGetUserSupportTickets,
  );
  app.get(
    "/api/support/tickets/:ticketId",
    authenticateUser,
    handleGetSupportTicket,
  );
  app.put(
    "/api/support/tickets/:ticketId/close",
    authenticateUser,
    handleCloseSupportTicket,
  );

  // Email service routes (authenticated)
  app.post(
    "/api/email/booking-confirmation",
    authMiddleware,
    handleSendBookingConfirmation,
  );
  app.post(
    "/api/email/payment-confirmation",
    authMiddleware,
    handleSendPaymentConfirmation,
  );
  app.post(
    "/api/email/support-ticket-confirmation",
    authMiddleware,
    handleSendSupportTicketConfirmation,
  );
  app.post(
    "/api/email/password-reset",
    authMiddleware,
    handleSendPasswordReset,
  );
  app.post("/api/email/welcome", authMiddleware, handleSendWelcomeEmail);
  app.post("/api/email/test", authMiddleware, handleTestEmail);

  // Amadeus API routes (public for flight search, some authenticated)
  app.get("/api/amadeus/flights/search", handleSearchFlights);
  app.get("/api/amadeus/airports/search", handleSearchAirports);
  app.post("/api/amadeus/flights/price", authMiddleware, handleGetFlightPrice);
  app.get("/api/amadeus/flights/seat-maps", authMiddleware, handleGetSeatMaps);
  app.get("/api/amadeus/airlines/:airlineCode", handleGetAirline);
  app.get("/api/amadeus/destinations/popular", handleGetPopularDestinations);
  app.get("/api/amadeus/health", handleAmadeusHealthCheck);

  // Stripe webhook routes (no authentication required)
  app.post("/api/webhooks/stripe", handleStripeWebhook);
  app.get("/api/webhooks/stripe/health", handleWebhookHealth);

  // Email verification routes (public)
  app.post("/api/auth/send-verification", handleSendVerificationEmail);
  app.get("/api/auth/verify-email", handleVerifyEmail);
  app.get("/api/auth/verification-status", handleCheckVerificationStatus);
  app.post("/api/auth/resend-verification", handleResendVerificationEmail);

  // Admin routes (with authentication)
  app.get("/api/admin/stats", authMiddleware, handleGetAdminStats);

  if (useSupabase) {
    app.get(
      "/api/admin/bookings",
      authMiddleware,
      handleGetAllSupabaseBookings,
    );
    app.put(
      "/api/admin/bookings/:bookingId/status",
      authMiddleware,
      handleUpdateSupabaseBookingStatus,
    );
  } else {
    app.get("/api/admin/bookings", authMiddleware, handleGetAllBookings);
    app.put(
      "/api/admin/bookings/:bookingId/status",
      authMiddleware,
      handleUpdateBookingStatus,
    );
  }

  app.get("/api/admin/payments", authMiddleware, handleGetAllTransactions);
  app.post(
    "/api/admin/payments/:transactionId/refund",
    authMiddleware,
    handleRefundPayment,
  );
  app.get(
    "/api/admin/support/tickets",
    authMiddleware,
    handleGetAllSupportTickets,
  );
  app.put(
    "/api/admin/support/tickets/:ticketId/status",
    authMiddleware,
    handleUpdateSupportTicketStatus,
  );
  app.get("/api/admin/support/stats", authMiddleware, handleGetSupportStats);
  app.get("/api/admin/users", authMiddleware, handleGetAllUsers);
  app.put(
    "/api/admin/users/:userId/status",
    authMiddleware,
    handleUpdateUserStatus,
  );

  // Error handling middleware
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Server error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && { error: err.message }),
      });
    },
  );

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "API endpoint not found",
    });
  });

  return app;
}
