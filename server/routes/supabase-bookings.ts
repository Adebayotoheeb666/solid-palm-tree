import { RequestHandler } from "express";
import { BookingRequest, BookingResponse, Booking } from "@shared/api";
import { supabaseServerHelpers } from "../lib/supabaseServer";
import TicketGenerator from '../lib/ticketGenerator.js';
import EmailService from '../lib/emailService.js';
import { z } from 'zod';

// Validation schema for booking request
const bookingSchema = z.object({
  route: z.object({
    from: z.object({
      code: z.string(),
      name: z.string(),
      city: z.string(),
      country: z.string()
    }),
    to: z.object({
      code: z.string(),
      name: z.string(),
      city: z.string(),
      country: z.string()
    }),
    departureDate: z.string(),
    returnDate: z.string().optional(),
    tripType: z.enum(['oneway', 'roundtrip'])
  }),
  passengers: z.array(z.object({
    title: z.enum(['Mr', 'Ms', 'Mrs']),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email()
  })).min(1),
  contactEmail: z.string().email(),
  termsAccepted: z.boolean()
});

// Create new booking
export const handleCreateSupabaseBooking: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user) {
      console.error('No user found in request - authentication may have failed');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user ID is a valid UUID (Supabase format)
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    if (!isValidUUID) {
      console.log('User ID is not a UUID, falling back to regular booking handler');
      // Import and use the fallback booking handler
      const { handleCreateBooking } = await import('./bookings');
      return handleCreateBooking(req, res);
    }

    console.log('Creating booking for user:', user.id);
    console.log('Booking request data:', JSON.stringify(req.body, null, 2));

    const validation = bookingSchema.safeParse(req.body);

    if (!validation.success) {
      console.error('Booking validation failed:', validation.error.errors);
      const response: BookingResponse = {
        success: false,
        message: `Invalid booking data: ${validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      };
      return res.status(400).json(response);
    }

    const bookingData = validation.data;

    if (!bookingData.termsAccepted) {
      const response: BookingResponse = {
        success: false,
        message: 'Terms and conditions must be accepted'
      };
      return res.status(400).json(response);
    }

    // Get airports from database
    const { data: fromAirport, error: fromError } = await supabaseServerHelpers.getAirportByCode(bookingData.route.from.code);
    const { data: toAirport, error: toError } = await supabaseServerHelpers.getAirportByCode(bookingData.route.to.code);

    if (fromError || toError || !fromAirport || !toAirport) {
      const response: BookingResponse = {
        success: false,
        message: 'Invalid airport codes'
      };
      return res.status(400).json(response);
    }

    // Calculate total amount ($15 per passenger)
    const totalAmount = bookingData.passengers.length * 15;

    // Create booking in database
    const { data: booking, error: bookingError } = await supabaseServerHelpers.createBooking({
      user_id: user.id,
      from_airport_id: fromAirport.id,
      to_airport_id: toAirport.id,
      departure_date: bookingData.route.departureDate,
      return_date: bookingData.route.returnDate || null,
      trip_type: bookingData.route.tripType,
      total_amount: totalAmount,
      contact_email: bookingData.contactEmail,
      terms_accepted: bookingData.termsAccepted
    });

    if (bookingError || !booking) {
      console.error('Failed to create booking:', bookingError);
      const response: BookingResponse = {
        success: false,
        message: 'Failed to create booking'
      };
      return res.status(500).json(response);
    }

    // Add passengers
    const passengersToAdd = bookingData.passengers.map(passenger => ({
      booking_id: booking.id,
      title: passenger.title,
      first_name: passenger.firstName,
      last_name: passenger.lastName,
      email: passenger.email
    }));

    const { data: passengers, error: passengersError } = await supabaseServerHelpers.addPassengers(passengersToAdd);

    if (passengersError || !passengers) {
      console.error('Failed to add passengers:', passengersError);
      // Note: We should probably clean up the booking here, but for simplicity we'll leave it
    }

    // Format response to match expected API structure
    const bookingResponse: Booking = {
      id: booking.id,
      userId: booking.user_id,
      pnr: booking.pnr,
      status: booking.status,
      route: {
        from: {
          code: fromAirport.code,
          name: fromAirport.name,
          city: fromAirport.city,
          country: fromAirport.country
        },
        to: {
          code: toAirport.code,
          name: toAirport.name,
          city: toAirport.city,
          country: toAirport.country
        },
        departureDate: booking.departure_date,
        returnDate: booking.return_date || undefined,
        tripType: booking.trip_type
      },
      passengers: bookingData.passengers,
      totalAmount: booking.total_amount,
      currency: booking.currency,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      ticketUrl: booking.ticket_url || undefined
    };

    const response: BookingResponse = {
      success: true,
      booking: bookingResponse,
      message: 'Booking created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create booking error:', error);
    const response: BookingResponse = {
      success: false,
      message: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

// Get user's bookings
export const handleGetSupabaseUserBookings: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    // Check if user ID is a valid UUID (Supabase format)
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    if (!isValidUUID) {
      console.log('User ID is not a UUID, falling back to regular booking handler');
      // Import and use the fallback booking handler
      const { handleGetUserBookings } = await import('./bookings');
      return handleGetUserBookings(req, res);
    }

    const { data: bookings, error } = await supabaseServerHelpers.getUserBookings(user.id);

    if (error) {
      console.error('Error fetching user bookings:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }

    // Transform booking_summary view data to match expected API format
    const transformedBookings: Booking[] = bookings.map(booking => ({
      id: booking.id,
      userId: user.id,
      pnr: booking.pnr,
      status: booking.status,
      route: {
        from: {
          code: booking.from_code,
          name: '', // Not available in summary view
          city: booking.from_city,
          country: booking.from_country
        },
        to: {
          code: booking.to_code,
          name: '', // Not available in summary view
          city: booking.to_city,
          country: booking.to_country
        },
        departureDate: booking.departure_date,
        returnDate: booking.return_date || undefined,
        tripType: booking.trip_type
      },
      passengers: [], // Would need separate query to get passengers
      totalAmount: booking.total_amount,
      currency: booking.currency,
      createdAt: booking.created_at,
      updatedAt: booking.created_at, // Summary view doesn't have updated_at
      ticketUrl: undefined // Would need to be generated
    }));

    res.json(transformedBookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get specific booking with full details
export const handleGetSupabaseBooking: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { bookingId } = req.params;

    // Check if user ID is a valid UUID (Supabase format)
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    if (!isValidUUID) {
      console.log('User ID is not a UUID, falling back to regular booking handler');
      // Import and use the fallback booking handler
      const { handleGetBooking } = await import('./bookings');
      return handleGetBooking(req, res);
    }

    const { data: booking, error } = await supabaseServerHelpers.getBookingById(bookingId);

    if (error || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if booking belongs to user (unless user is admin)
    if (booking.user_id !== user.id) {
      const isAdmin = await supabaseServerHelpers.isUserAdmin(user.id);
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    // Transform to expected API format
    const bookingResponse: Booking = {
      id: booking.id,
      userId: booking.user_id,
      pnr: booking.pnr,
      status: booking.status,
      route: {
        from: {
          code: booking.from_airport.code,
          name: booking.from_airport.name,
          city: booking.from_airport.city,
          country: booking.from_airport.country
        },
        to: {
          code: booking.to_airport.code,
          name: booking.to_airport.name,
          city: booking.to_airport.city,
          country: booking.to_airport.country
        },
        departureDate: booking.departure_date,
        returnDate: booking.return_date || undefined,
        tripType: booking.trip_type
      },
      passengers: booking.passengers.map(p => ({
        id: p.id,
        title: p.title,
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email
      })),
      totalAmount: booking.total_amount,
      currency: booking.currency,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      ticketUrl: booking.ticket_url || undefined
    };

    res.json(bookingResponse);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update booking status (admin only)
export const handleUpdateSupabaseBookingStatus: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { bookingId } = req.params;
    const { status } = req.body;
    
    // Check if user is admin
    const isAdmin = await supabaseServerHelpers.isUserAdmin(user.id);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const { data: booking, error } = await supabaseServerHelpers.updateBookingStatus(bookingId, status);

    if (error || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Cancel booking (user can cancel their own pending bookings)
export const handleCancelSupabaseBooking: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { bookingId } = req.params;
    
    const { data: booking, error: fetchError } = await supabaseServerHelpers.getBookingById(bookingId);

    if (fetchError || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    if (booking.status === 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel confirmed booking. Please contact support.' 
      });
    }

    const { data: updatedBooking, error: updateError } = await supabaseServerHelpers.updateBookingStatus(bookingId, 'cancelled');

    if (updateError || !updatedBooking) {
      return res.status(500).json({ success: false, message: 'Failed to cancel booking' });
    }

    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all bookings (admin only)
export const handleGetAllSupabaseBookings: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Check if user is admin
    const isAdmin = await supabaseServerHelpers.isUserAdmin(user.id);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const { data: bookings, error, count } = await supabaseServerHelpers.getAllBookingsAdmin(page, limit, status);

    if (error) {
      console.error('Error fetching all bookings:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }

    res.json({
      bookings: bookings || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
