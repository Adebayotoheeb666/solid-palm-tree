import { RequestHandler } from "express";
import { supabaseServerHelpers } from "../lib/supabaseServer";
import { StripeService } from "../lib/stripeService";

// Create Stripe Payment Intent for guest bookings
export const handleCreateGuestStripePaymentIntent: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { bookingId, amount, currency = "USD", pnr, contactEmail } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bookingId and amount",
      });
    }

    // For guest bookings, we need PNR and contact email for verification
    if (!pnr || !contactEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for guest booking: pnr and contactEmail",
      });
    }

    try {
      console.log("Creating guest payment intent for booking:", bookingId);

      // Find booking in Supabase
      const { data: booking, error: bookingError } =
        await supabaseServerHelpers.getBookingById(bookingId);

      if (bookingError || !booking) {
        console.error("Booking not found:", bookingError);
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Verify this is a guest booking by checking PNR and contact email
      if (booking.pnr !== pnr || booking.contact_email !== contactEmail) {
        console.error("Guest booking verification failed:", {
          providedPnr: pnr,
          bookingPnr: booking.pnr,
          providedEmail: contactEmail,
          bookingEmail: booking.contact_email,
        });
        return res.status(403).json({
          success: false,
          message: "Booking verification failed",
        });
      }

      if (booking.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Booking is not eligible for payment",
        });
      }

      console.log(
        "Creating Stripe payment intent for guest booking:",
        bookingId,
        "PNR:",
        pnr,
        "amount:",
        amount,
      );

      // Check if Stripe is configured
      if (!StripeService.isConfigured()) {
        console.log("Stripe not configured, returning demo mode response");
        return res.json({
          success: true,
          clientSecret: `pi_demo_${Date.now()}_secret`,
          paymentIntentId: `pi_demo_${Date.now()}`,
          demoMode: true,
          message: "Stripe demo mode - payment will be simulated",
        });
      }

      // Create payment intent with Stripe
      const amountInCents = Math.round(amount * 100);
      const paymentIntent = await StripeService.createPaymentIntent(
        amountInCents,
        currency,
        {
          bookingId,
          pnr,
          contactEmail,
          guestBooking: true,
        },
      );

      console.log("Stripe payment intent created:", paymentIntent.id);

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        demoMode: false,
      });
    } catch (error) {
      console.error("Payment intent creation error:", error);
      
      // Return demo mode response if Stripe fails
      console.log("Stripe failed, falling back to demo mode");
      res.json({
        success: true,
        clientSecret: `pi_demo_${Date.now()}_secret`,
        paymentIntentId: `pi_demo_${Date.now()}`,
        demoMode: true,
        message: "Payment will be simulated in demo mode",
      });
    }
  } catch (error) {
    console.error("Guest payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
