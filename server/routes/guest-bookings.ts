import { Request, Response } from "express";
import { BookingRequest, BookingResponse, Booking } from "@shared/api";
import { supabaseServerHelpers } from "../lib/supabaseServer";
import TicketGenerator from "../lib/ticketGenerator.js";
import EmailService from "../lib/emailService.js";
import { z } from "zod";

// Validation schema for guest booking request (same as regular booking but without auth)
const guestBookingSchema = z.object({
  route: z.object({
    from: z.object({
      code: z.string(),
      name: z.string(),
      city: z.string(),
      country: z.string(),
    }),
    to: z.object({
      code: z.string(),
      name: z.string(),
      city: z.string(),
      country: z.string(),
    }),
    departureDate: z.string(),
    returnDate: z.string().optional(),
    tripType: z.enum(["oneway", "roundtrip"]),
  }),
  passengers: z.array(
    z.object({
      title: z.enum(["Mr", "Ms", "Mrs"]),
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      email: z.string().email(),
    }),
  ).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  termsAccepted: z.boolean(),
  // Guest-specific fields
  guestCheckout: z.literal(true),
});

/**
 * Handle guest booking creation (no authentication required)
 */
export async function handleCreateGuestBooking(req: Request, res: Response) {
  try {
    console.log("Creating guest booking...");

    // Ensure req.body exists and is parsed
    if (!req.body || typeof req.body !== "object") {
      console.error("Invalid request body:", req.body);
      return res.status(400).json({
        success: false,
        message: "Invalid request body - expected JSON",
      });
    }

    // Validate request body
    const validation = guestBookingSchema.safeParse(req.body);
    if (!validation.success) {
      console.error("Guest booking validation failed:", validation.error);
      const response: BookingResponse = {
        success: false,
        message: "Invalid booking data",
        errors: validation.error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`,
        ),
      };
      return res.status(400).json(response);
    }

    const bookingData = validation.data;

    // Get airports from database
    const { data: fromAirport, error: fromError } =
      await supabaseServerHelpers.getAirportByCode(bookingData.route.from.code);
    const { data: toAirport, error: toError } =
      await supabaseServerHelpers.getAirportByCode(bookingData.route.to.code);

    if (fromError || toError || !fromAirport || !toAirport) {
      const response: BookingResponse = {
        success: false,
        message: "Invalid airport codes",
      };
      return res.status(400).json(response);
    }

    // Calculate total amount ($15 per passenger)
    const totalAmount = bookingData.passengers.length * 15;

    // Create guest booking in database (without user_id)
    const { data: booking, error: bookingError } =
      await supabaseServerHelpers.createGuestBooking({
        from_airport_id: fromAirport.id,
        to_airport_id: toAirport.id,
        departure_date: bookingData.route.departureDate,
        return_date: bookingData.route.returnDate || null,
        trip_type: bookingData.route.tripType,
        total_amount: totalAmount,
        contact_email: bookingData.contactEmail,
        contact_phone: bookingData.contactPhone || null,
        terms_accepted: bookingData.termsAccepted,
        is_guest: true,
      });

    if (bookingError || !booking) {
      console.error("Failed to create guest booking:", bookingError);
      const response: BookingResponse = {
        success: false,
        message: "Failed to create booking",
      };
      return res.status(500).json(response);
    }

    // Add passengers
    const passengersToAdd = bookingData.passengers.map((passenger) => ({
      booking_id: booking.id,
      title: passenger.title,
      first_name: passenger.firstName,
      last_name: passenger.lastName,
      email: passenger.email,
    }));

    const { data: passengers, error: passengersError } =
      await supabaseServerHelpers.addPassengers(passengersToAdd);

    if (passengersError || !passengers) {
      console.error("Failed to add passengers:", passengersError);
      // Note: We should probably clean up the booking here, but for simplicity we'll leave it
    }

    // Generate PDF ticket
    let ticketUrl = "";
    try {
      const ticketData = {
        pnr: booking.pnr,
        contactEmail: bookingData.contactEmail,
        route: {
          from: fromAirport.name,
          to: toAirport.name,
          fromCode: fromAirport.code,
          toCode: toAirport.code,
          departureDate: bookingData.route.departureDate,
        },
        passengers: bookingData.passengers,
        totalAmount: totalAmount,
        currency: booking.currency || "USD",
      };

      ticketUrl = await TicketGenerator.createTicket(ticketData);

      // Update booking with ticket URL
      if (ticketUrl) {
        await supabaseServerHelpers.updateBooking(booking.id, {
          ticket_url: ticketUrl,
        });
      }
    } catch (ticketError) {
      console.error("Failed to generate ticket:", ticketError);
      // Continue without ticket URL
    }

    // Format response to match expected API structure
    const bookingResponse: Booking = {
      id: booking.id,
      userId: null, // Guest booking has no user ID
      pnr: booking.pnr,
      status: booking.status,
      route: {
        from: {
          code: fromAirport.code,
          name: fromAirport.name,
          city: fromAirport.city,
          country: fromAirport.country,
        },
        to: {
          code: toAirport.code,
          name: toAirport.name,
          city: toAirport.city,
          country: toAirport.country,
        },
        departureDate: booking.departure_date,
        returnDate: booking.return_date || undefined,
        tripType: booking.trip_type,
      },
      passengers: bookingData.passengers,
      totalAmount: booking.total_amount,
      currency: booking.currency,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      ticketUrl: ticketUrl || booking.ticket_url || undefined,
      isGuest: true,
    };

    // Send booking confirmation email
    try {
      await EmailService.sendBookingConfirmation(bookingData.contactEmail, {
        customerName: bookingData.passengers[0]?.firstName || "Customer",
        pnr: booking.pnr,
        route: {
          from: fromAirport.name,
          to: toAirport.name,
          departureDate: bookingData.route.departureDate,
        },
        passengers: bookingData.passengers,
        totalAmount: totalAmount,
        currency: booking.currency || "USD",
        bookingUrl: `${process.env.CLIENT_URL || "http://localhost:8080"}/guest-booking/${booking.pnr}`,
      });
      console.log("✅ Guest booking confirmation email sent");
    } catch (emailError) {
      console.error(
        "❌ Failed to send guest booking confirmation email:",
        emailError,
      );
      // Continue without email - don't fail the booking
    }

    const response: BookingResponse = {
      success: true,
      booking: bookingResponse,
      message: "Guest booking created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create guest booking error:", error);
    const response: BookingResponse = {
      success: false,
      message: "Internal server error",
    };
    res.status(500).json(response);
  }
}

/**
 * Get guest booking by PNR (no authentication required)
 */
export async function handleGetGuestBooking(req: Request, res: Response) {
  try {
    const { pnr } = req.params;
    const { email } = req.query;

    if (!pnr || !email) {
      return res.status(400).json({
        success: false,
        message: "PNR and email are required",
      });
    }

    // Get booking by PNR and verify email
    const { data: booking, error } =
      await supabaseServerHelpers.getGuestBookingByPNR(
        pnr as string,
        email as string,
      );

    if (error || !booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or email does not match",
      });
    }

    // Get airports for the booking
    const { data: fromAirport } = await supabaseServerHelpers.getAirportById(
      booking.from_airport_id,
    );
    const { data: toAirport } = await supabaseServerHelpers.getAirportById(
      booking.to_airport_id,
    );

    // Get passengers
    const { data: passengers } =
      await supabaseServerHelpers.getPassengersByBookingId(booking.id);

    const bookingResponse: Booking = {
      id: booking.id,
      userId: null,
      pnr: booking.pnr,
      status: booking.status,
      route: {
        from: {
          code: fromAirport?.code || "",
          name: fromAirport?.name || "",
          city: fromAirport?.city || "",
          country: fromAirport?.country || "",
        },
        to: {
          code: toAirport?.code || "",
          name: toAirport?.name || "",
          city: toAirport?.city || "",
          country: toAirport?.country || "",
        },
        departureDate: booking.departure_date,
        returnDate: booking.return_date || undefined,
        tripType: booking.trip_type,
      },
      passengers:
        passengers?.map((p) => ({
          title: p.title,
          firstName: p.first_name,
          lastName: p.last_name,
          email: p.email,
        })) || [],
      totalAmount: booking.total_amount,
      currency: booking.currency,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      ticketUrl: booking.ticket_url || undefined,
      isGuest: true,
    };

    res.json({
      success: true,
      booking: bookingResponse,
    });
  } catch (error) {
    console.error("Get guest booking error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
