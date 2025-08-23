/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Authentication and User Management Types
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title: "Mr" | "Ms" | "Mrs";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title: "Mr" | "Ms" | "Mrs";
}

/**
 * Booking and Reservation Types
 */
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightRoute {
  from: Airport;
  to: Airport;
  departureDate: string;
  returnDate?: string;
  tripType: "oneway" | "roundtrip";
}

export interface Passenger {
  id?: string;
  title: "Mr" | "Ms" | "Mrs";
  firstName: string;
  lastName: string;
  email: string;
}

export interface BookingRequest {
  route: FlightRoute;
  passengers: Passenger[];
  contactEmail: string;
  termsAccepted: boolean;
  selectedFlight?: FlightOffer | null;
  totalAmount?: number;
  guestCheckout?: boolean;
}

export interface Booking {
  id: string;
  userId: string | null;
  pnr: string;
  status: "pending" | "confirmed" | "cancelled" | "expired";
  route: FlightRoute;
  passengers: Passenger[];
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  ticketUrl?: string;
  selectedFlight?: FlightOffer | null;
  basePrice?: number;
  isGuest?: boolean;
}

export interface BookingResponse {
  success: boolean;
  booking?: Booking;
  message?: string;
}

/**
 * Payment Types
 */
export interface PaymentRequest {
  bookingId: string;
  paymentMethod: "card" | "paypal" | "stripe";
  paymentDetails: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
    country?: string;
    paypalOrderId?: string;
    paypalPayerId?: string;
    stripePaymentIntentId?: string;
    stripePaymentMethodId?: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
}

/**
 * Support and Communication Types
 */
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketRequest {
  subject: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: "booking" | "payment" | "technical" | "general";
}

/**
 * Analytics and Dashboard Types
 */
export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  completionRate: number;
  averageBookingValue: number;
  topRoutes: Array<{
    route: string;
    count: number;
  }>;
}

export interface UserDashboardData {
  user: User;
  recentBookings: Booking[];
  totalBookings: number;
  upcomingTrips: Booking[];
}

/**
 * Amadeus Flight Search Types
 */
export interface FlightSearchRequest {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  currencyCode?: string;
  max?: number;
}

export interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: FlightItinerary[];
  price: FlightPrice;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface FlightPrice {
  currency: string;
  total: string;
  base: string;
  fees: Array<{
    amount: string;
    type: string;
  }>;
  grandTotal: string;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: FlightPrice;
  fareDetailsBySegment: Array<{
    segmentId: string;
    cabin: string;
    fareBasis: string;
    class: string;
    includedCheckedBags: {
      quantity: number;
    };
  }>;
}

export interface AirportLocation {
  type: string;
  subType: string;
  name: string;
  detailedName: string;
  id: string;
  timeZoneOffset: string;
  iataCode: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    cityName: string;
    cityCode: string;
    countryName: string;
    countryCode: string;
    regionCode: string;
  };
  analytics: {
    travelers: {
      score: number;
    };
  };
}

export interface PopularDestination {
  iataCode: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  image: string;
  description: string;
}
