import { RequestHandler } from "express";
import { UserDashboardData, Booking } from "@shared/api";
import { supabaseServerHelpers } from "../lib/supabaseServer";

// Get user dashboard data
export const handleGetDashboard: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    // Get user's bookings from Supabase
    const { data: userBookings, error } = await supabaseServerHelpers.getUserBookings(user.id);

    if (error) {
      console.error('Error fetching user bookings:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }

    const bookings = userBookings || [];

    // Transform Supabase data to match expected format
    const transformedBookings: Booking[] = bookings.map(booking => ({
      id: booking.id,
      userId: booking.user_id,
      pnr: booking.pnr,
      status: booking.status,
      route: {
        from: {
          code: booking.from_airport_code,
          name: booking.from_airport_name,
          city: booking.from_airport_city,
          country: booking.from_airport_country
        },
        to: {
          code: booking.to_airport_code,
          name: booking.to_airport_name,
          city: booking.to_airport_city,
          country: booking.to_airport_country
        },
        departureDate: booking.departure_date,
        returnDate: booking.return_date,
        tripType: booking.trip_type as "oneway" | "roundtrip"
      },
      passengers: [],
      totalAmount: booking.total_amount,
      currency: booking.currency || 'USD',
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      ticketUrl: booking.ticket_url
    }));

    // Get recent bookings (last 5)
    const recentBookings = transformedBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Get upcoming trips
    const now = new Date();
    const upcomingTrips = transformedBookings
      .filter(booking =>
        booking.status === "confirmed" &&
        new Date(booking.route.departureDate) > now
      )
      .sort((a, b) => new Date(a.route.departureDate).getTime() - new Date(b.route.departureDate).getTime())
      .slice(0, 3);

    const dashboardData: UserDashboardData = {
      user,
      recentBookings,
      totalBookings: transformedBookings.length,
      upcomingTrips
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get user's bookings
export const handleGetBookings: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    // Get user's bookings from Supabase
    const { data: userBookings, error } = await supabaseServerHelpers.getUserBookings(user.id);

    if (error) {
      console.error('Error fetching user bookings:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }

    // Transform Supabase data to match expected format
    const transformedBookings: Booking[] = (userBookings || []).map(booking => ({
      id: booking.id,
      userId: booking.user_id,
      pnr: booking.pnr,
      status: booking.status,
      route: {
        from: {
          code: booking.from_airport_code,
          name: booking.from_airport_name,
          city: booking.from_airport_city,
          country: booking.from_airport_country
        },
        to: {
          code: booking.to_airport_code,
          name: booking.to_airport_name,
          city: booking.to_airport_city,
          country: booking.to_airport_country
        },
        departureDate: booking.departure_date,
        returnDate: booking.return_date,
        tripType: booking.trip_type as "oneway" | "roundtrip"
      },
      passengers: [],
      totalAmount: booking.total_amount,
      currency: booking.currency || 'USD',
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      ticketUrl: booking.ticket_url
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(transformedBookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get specific booking details
export const handleGetBooking: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { bookingId } = req.params;

    const { data: booking, error } = await supabaseServerHelpers.getBookingById(bookingId);

    if (error || !booking) {
      console.error('Error fetching booking:', error);
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Transform Supabase data to match expected format
    const transformedBooking: Booking = {
      id: booking.id,
      userId: booking.user_id,
      pnr: booking.pnr,
      status: booking.status,
      route: {
        from: {
          code: booking.from_airport?.code || '',
          name: booking.from_airport?.name || '',
          city: booking.from_airport?.city || '',
          country: booking.from_airport?.country || ''
        },
        to: {
          code: booking.to_airport?.code || '',
          name: booking.to_airport?.name || '',
          city: booking.to_airport?.city || '',
          country: booking.to_airport?.country || ''
        },
        departureDate: booking.departure_date,
        returnDate: booking.return_date,
        tripType: booking.trip_type as "oneway" | "roundtrip"
      },
      passengers: booking.passengers || [],
      totalAmount: booking.total_amount,
      currency: booking.currency || 'USD',
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      ticketUrl: booking.ticket_url
    };

    res.json(transformedBooking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update user profile
export const handleUpdateProfile: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { firstName, lastName, title } = req.body;

    // Validate input
    if (!firstName || !lastName || !title) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Update user in database
    const { data: updatedUser, error } = await supabaseServerHelpers.getUserById(user.id);

    if (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }

    const transformedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      title: updatedUser.title,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };

    res.json({ success: true, user: transformedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
