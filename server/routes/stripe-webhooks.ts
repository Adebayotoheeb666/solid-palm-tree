import { RequestHandler } from "express";
import Stripe from "stripe";
import { getAllBookings } from "./user";

// Initialize Stripe with webhook secret
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Get bookings array for updates
let bookings = getAllBookings();

// Find booking by payment intent ID
const findBookingByPaymentIntent = (paymentIntentId: string) => {
  return bookings.find(
    (booking) =>
      (booking.id && booking.id.includes("stripe")) ||
      booking.pnr === paymentIntentId ||
      (booking as any).paymentIntentId === paymentIntentId,
  );
};

// Update booking status
const updateBookingStatus = (
  bookingId: string,
  status: "confirmed" | "cancelled" | "pending",
) => {
  const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
  if (bookingIndex !== -1) {
    bookings[bookingIndex].status = status;
    bookings[bookingIndex].updatedAt = new Date().toISOString();
    console.log(`Updated booking ${bookingId} status to ${status}`);
    return bookings[bookingIndex];
  }
  return null;
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (booking: any) => {
  try {
    if (!booking.passengers?.[0]?.email) {
      console.log("No passenger email found for booking confirmation");
      return;
    }

    const emailData = {
      to: booking.passengers[0].email,
      bookingData: {
        customerName: `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`,
        pnr: booking.pnr,
        route: {
          from: booking.route.from.code,
          to: booking.route.to.code,
          departureDate: booking.route.departureDate,
        },
        passengers: booking.passengers,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        bookingUrl: `${process.env.CLIENT_URL || "http://localhost:8080"}/booking/${booking.id}`,
      },
    };

    // Send booking confirmation email automatically
    console.log("Sending booking confirmation email:", emailData);

    try {
      const response = await fetch(
        `${process.env.CLIENT_URL || "http://localhost:8080"}/api/email/booking-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SYSTEM_API_KEY || "system"}`, // Use system auth for webhooks
          },
          body: JSON.stringify(emailData),
        },
      );

      if (response.ok) {
        console.log("✅ Booking confirmation email sent successfully");
      } else {
        console.error(
          "❌ Failed to send booking confirmation email:",
          response.status,
        );
      }
    } catch (error) {
      console.error("❌ Error sending booking confirmation email:", error);
    }
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
  }
};

// Main webhook handler
export const handleStripeWebhook: RequestHandler = async (req, res) => {
  if (!stripe || !webhookSecret) {
    console.error("Stripe webhook handler: Missing Stripe configuration");
    return res.status(500).json({
      success: false,
      message: "Stripe not configured",
    });
  }

  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log(`Received Stripe webhook event: ${event.type}`);
  } catch (err) {
    console.error(`Stripe webhook signature verification failed:`, err);
    return res.status(400).json({
      success: false,
      message: "Webhook signature verification failed",
    });
  }

  try {
    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);

        // Find associated booking
        const booking = findBookingByPaymentIntent(paymentIntent.id);
        if (booking) {
          // Update booking status to confirmed
          const updatedBooking = updateBookingStatus(booking.id, "confirmed");

          if (updatedBooking) {
            // Send confirmation email
            await sendBookingConfirmationEmail(updatedBooking);
            console.log(`Booking ${booking.id} confirmed and email sent`);
          }
        } else {
          console.log(
            `No booking found for payment intent: ${paymentIntent.id}`,
          );
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);

        // Find associated booking
        const booking = findBookingByPaymentIntent(paymentIntent.id);
        if (booking) {
          // Update booking status to cancelled
          updateBookingStatus(booking.id, "cancelled");
          console.log(`Booking ${booking.id} cancelled due to payment failure`);
        }
        break;
      }

      case "payment_intent.requires_action": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment requires action: ${paymentIntent.id}`);

        // Find associated booking and keep it as pending
        const booking = findBookingByPaymentIntent(paymentIntent.id);
        if (booking) {
          updateBookingStatus(booking.id, "pending");
          console.log(
            `Booking ${booking.id} marked as pending - requires action`,
          );
        }
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment canceled: ${paymentIntent.id}`);

        // Find associated booking
        const booking = findBookingByPaymentIntent(paymentIntent.id);
        if (booking) {
          updateBookingStatus(booking.id, "cancelled");
          console.log(`Booking ${booking.id} cancelled`);
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        console.log(`Dispute created for charge: ${dispute.charge}`);

        // Handle dispute - you might want to notify admin or update booking
        // For now, just log it
        console.log(`Dispute reason: ${dispute.reason}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe webhook event type: ${event.type}`);
    }

    // Return success response to Stripe
    res.json({
      success: true,
      message: "Webhook processed successfully",
      eventType: event.type,
    });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

// Health check for webhook endpoint
export const handleWebhookHealth: RequestHandler = (req, res) => {
  res.json({
    success: true,
    message: "Stripe webhook endpoint is healthy",
    configured: !!(stripe && webhookSecret),
    timestamp: new Date().toISOString(),
  });
};
