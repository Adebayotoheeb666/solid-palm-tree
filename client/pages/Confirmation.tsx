import { useState, useEffect } from "react";
import {
  ArrowRight,
  Mail,
  Check,
  Plane,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
} from "lucide-react";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FlightRoute, Passenger, BookingRequest } from "@shared/api";

interface ConfirmationProps {
  onNext: () => void;
  onBack: () => void;
  currentStep: string;
  onNavigate: (step: any) => void;
}

interface BookingData {
  route: FlightRoute | null;
  passengers: Passenger[];
  contactEmail: string;
  selectedFlight: any | null;
}

export default function Confirmation({
  onNext,
  onBack,
  currentStep,
  onNavigate,
}: ConfirmationProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingData, setBookingData] = useState<BookingData>({
    route: null,
    passengers: [],
    contactEmail: "",
    selectedFlight: null,
  });

  // Load saved booking data
  useEffect(() => {
    const loadBookingData = () => {
      try {
        // Load route data
        const savedRoute =
          localStorage.getItem("selectedRoute") ||
          localStorage.getItem("bookingRoute");
        let route = null;
        if (savedRoute) {
          route = JSON.parse(savedRoute);
        }

        // Load passenger data
        const savedPassengers = localStorage.getItem("bookingPassengers");
        const savedContactEmail = localStorage.getItem("bookingContactEmail");

        // Load selected flight data
        const savedFlight = localStorage.getItem("selectedFlight");
        let selectedFlight = null;
        if (savedFlight) {
          selectedFlight = JSON.parse(savedFlight);
        }

        let passengers: Passenger[] = [];
        let contactEmail = "";

        if (savedPassengers) {
          passengers = JSON.parse(savedPassengers);
        }

        if (savedContactEmail) {
          contactEmail = savedContactEmail;
        }

        setBookingData({
          route,
          passengers,
          contactEmail,
          selectedFlight,
        });

        console.log("Loaded booking data:", {
          route,
          passengers,
          contactEmail,
          selectedFlight,
        });
      } catch (error) {
        console.error("Error loading booking data:", error);
        setError("Error loading booking data. Please go back and try again.");
      }
    };

    loadBookingData();
  }, []);

  // Calculate total amount based on selected flight or fallback to $15
  const calculateTotalAmount = () => {
    if (bookingData.selectedFlight && bookingData.selectedFlight.price) {
      const flightPrice = parseFloat(bookingData.selectedFlight.price.total);
      return flightPrice * bookingData.passengers.length;
    }
    // Fallback to $15 per passenger if no flight selected
    return bookingData.passengers.length * 15;
  };

  const totalAmount = calculateTotalAmount();
  const basePrice =
    bookingData.selectedFlight && bookingData.selectedFlight.price
      ? parseFloat(bookingData.selectedFlight.price.total)
      : 15;

  // Handle booking creation (simplified for guest checkout)
  const handleCreateBooking = async () => {
    // Prevent duplicate requests
    if (loading) {
      console.log("Request already in progress, skipping duplicate call");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }

    if (!bookingData.route || bookingData.passengers.length === 0) {
      setError(
        "Missing booking information. Please go back and complete all steps.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bookingRequest: BookingRequest = {
        route: bookingData.route,
        passengers: bookingData.passengers,
        contactEmail: bookingData.contactEmail,
        termsAccepted: acceptTerms,
        selectedFlight: bookingData.selectedFlight || null,
        totalAmount: totalAmount,
        guestCheckout: true, // Always use guest checkout for simplicity
      };

      console.log("Creating booking:", bookingRequest);

      // Create fresh request options each time to avoid stream reuse
      const requestOptions = {
        method: "POST" as const,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingRequest),
      };

      // Always use guest booking endpoint for simplicity
      const response = await fetch("/api/guest/bookings", requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.booking) {
        // Save booking ID for payment
        localStorage.setItem("currentBookingId", result.booking.id);
        localStorage.setItem("currentBooking", JSON.stringify(result.booking));

        console.log("Booking created successfully:", result.booking);

        // Navigate to payment
        navigate("/payment");
      } else {
        setError(
          result.message || "Failed to create booking. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof Error) {
        setError(`Network error: ${error.message}. Please check your connection and try again.`);
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ticket-primary text-white">
      <div className="px-4 sm:px-8 lg:px-36">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("route")}
              className="text-2xl font-bold text-white/60 hover:text-white transition-colors"
            >
              Route
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("passengers")}
              className="text-2xl font-bold text-white/60 hover:text-white transition-colors"
            >
              Passengers
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-2xl font-bold">Confirmation</button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex items-center">
            <div className="h-1 bg-ticket-secondary flex-1"></div>
            <div className="h-1 bg-ticket-accent w-56"></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Left Side - Booking Details */}
          <div className="space-y-8">
            {/* Route Information */}
            {bookingData.route && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-[#F6F6FF]">
                  Flight Route
                </h2>

                <div className="bg-ticket-secondary rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-white/60" />
                    <div className="flex-1">
                      <div className="text-lg font-semibold">
                        {bookingData.route.from.city} (
                        {bookingData.route.from.code}) →{" "}
                        {bookingData.route.to.city} ({bookingData.route.to.code}
                        )
                      </div>
                      <div className="text-sm text-white/70">
                        {bookingData.route.from.name} →{" "}
                        {bookingData.route.to.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-white/60" />
                    <div>
                      <div className="text-sm text-white/70">Departure</div>
                      <div className="font-semibold">
                        {new Date(
                          bookingData.route.departureDate,
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    {bookingData.route.returnDate && (
                      <>
                        <div className="text-white/40 mx-4">•</div>
                        <div>
                          <div className="text-sm text-white/70">Return</div>
                          <div className="font-semibold">
                            {new Date(
                              bookingData.route.returnDate,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/20">
                    <span className="text-sm text-white/70">Trip Type: </span>
                    <span className="font-semibold capitalize">
                      {bookingData.route.tripType}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Passenger Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[#F6F6FF]">
                Passengers
              </h2>

              <div className="bg-ticket-secondary rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-white/60" />
                  <span className="text-lg font-semibold">
                    {bookingData.passengers.length} Passenger
                    {bookingData.passengers.length > 1 ? "s" : ""}
                  </span>
                </div>

                {bookingData.passengers.map((passenger, index) => (
                  <div key={index} className="bg-[#606AFB]/30 rounded-lg p-4">
                    <div className="text-sm text-white/70 mb-2">
                      Passenger {index + 1}
                    </div>
                    <div className="font-semibold">
                      {passenger.title} {passenger.firstName}{" "}
                      {passenger.lastName}
                    </div>
                    <div className="text-sm text-white/70">
                      {passenger.email}
                    </div>
                  </div>
                ))}

                {bookingData.contactEmail && (
                  <div className="pt-4 border-t border-white/20">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-white/60" />
                      <div>
                        <div className="text-sm text-white/70">
                          Contact Email
                        </div>
                        <div className="font-semibold">
                          {bookingData.contactEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Pricing & Confirmation */}
          <div className="space-y-8">
            {/* Pricing Summary */}
            <div className="bg-ticket-secondary rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#F6F6FF]">
                Booking Summary
              </h3>

              <div className="space-y-3">
                {bookingData.selectedFlight && (
                  <div className="mb-4 p-3 bg-ticket-accent/20 rounded-lg">
                    <div className="text-sm text-white/90 mb-2">
                      Selected Flight
                    </div>
                    <div className="text-xs text-white/70">
                      {bookingData.selectedFlight.validatingAirlineCodes?.[0]}{" "}
                      Flight
                      {bookingData.selectedFlight.price?.currency}{" "}
                      {parseInt(
                        bookingData.selectedFlight.price?.total || "0",
                      ).toLocaleString()}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/70">
                    Base price per passenger
                  </span>
                  <span className="font-semibold">${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Number of passengers</span>
                  <span className="font-semibold">
                    {bookingData.passengers.length}
                  </span>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-bold text-ticket-accent">
                      {bookingData.selectedFlight?.price?.currency || "$"}
                      {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code for Ticket Access */}
            {bookingData.contactEmail && (
              <div className="bg-ticket-secondary rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-[#F6F6FF]">
                  Quick Access
                </h3>
                <div className="flex flex-col items-center">
                  <QRCodeDisplay
                    value={`${window.location.origin}/guest-booking-lookup?email=${encodeURIComponent(bookingData.contactEmail)}`}
                    size={120}
                    title="Scan to Find Your Booking"
                    className="mb-3"
                  />
                  <p className="text-sm text-white/80 text-center">
                    Scan this QR code with your phone to quickly access your
                    booking details anytime
                  </p>
                </div>
              </div>
            )}

            {/* Booking Notice */}
            <div className="bg-ticket-accent/20 border border-ticket-accent/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-ticket-accent rounded-full"></div>
                <h4 className="text-sm font-semibold text-ticket-accent">
                  Quick Booking
                </h4>
              </div>
              <p className="text-xs text-white/80">
                Your booking confirmation and e-ticket will be sent to your
                email. You can view your booking anytime using our{" "}
                <button
                  onClick={() => navigate("/guest-booking-lookup")}
                  className="text-ticket-accent hover:underline font-medium"
                >
                  booking lookup
                </button>{" "}
                feature.
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-ticket-secondary rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#F6F6FF]">
                Terms & Conditions
              </h3>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-white/40 bg-transparent checked:bg-ticket-accent checked:border-ticket-accent focus:ring-2 focus:ring-ticket-accent/50"
                    />
                  </div>
                  <div className="text-sm text-white/90">
                    I accept the{" "}
                    <button
                      onClick={() => navigate("/terms-conditions")}
                      className="text-ticket-accent hover:underline"
                    >
                      Terms & Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      onClick={() => navigate("/privacy-policy")}
                      className="text-ticket-accent hover:underline"
                    >
                      Privacy Policy
                    </button>
                    . I understand this is a flight reservation for visa
                    purposes.
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleCreateBooking}
                disabled={
                  !acceptTerms ||
                  loading ||
                  !bookingData.route ||
                  bookingData.passengers.length === 0
                }
                className="w-full bg-ticket-accent hover:bg-ticket-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Booking...
                  </>
                ) : (
                  <>
                    Create Booking & Pay
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={onBack}
                disabled={loading}
                className="w-full bg-transparent border-2 border-white/40 hover:border-white/60 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Passengers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
