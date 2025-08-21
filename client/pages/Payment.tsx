import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  AlertCircle,
  Shield,
  Lock,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormValidation } from "../hooks/useFormValidation";
import { PaymentRequest, PaymentResponse } from "@shared/api";
import { useAuth } from "../hooks/useAuth";
import { useAuthenticatedFetch } from "../hooks/useAuth";
import StripePaymentForm from "../components/StripePaymentForm";
import { countries } from "../lib/countries";

export default function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [passengerData, setPassengerData] = useState<any>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<{
    publishableKey: string | null;
    demoMode: boolean;
  }>({ publishableKey: null, demoMode: true });

  const [paymentDetails, setPaymentDetails] = useState({
    country: "",
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  // Validation rules for payment form
  const validationRules = {
    country: [{ required: true, message: "Country is required" }],
    cardholderName: [
      { required: true, message: "Cardholder name is required" },
      { minLength: 2, message: "Name must be at least 2 characters" },
      {
        pattern: /^[a-zA-Z\s-']+$/,
        message:
          "Name can only contain letters, spaces, hyphens, and apostrophes",
      },
    ],
    cardNumber: [
      { required: true, message: "Card number is required" },
      {
        pattern: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
        message: "Please enter a valid 16-digit card number",
      },
    ],
    expiryDate: [
      { required: true, message: "Expiry date is required" },
      {
        pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
        message: "Please enter date in MM/YY format",
      },
      {
        custom: (value: string) => {
          if (!value) return false;
          const [month, year] = value.split("/");
          const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
          return expiry > new Date();
        },
        message: "Card has expired",
      },
    ],
    cvv: [
      { required: true, message: "CVV is required" },
      { pattern: /^\d{3,4}$/, message: "CVV must be 3 or 4 digits" },
    ],
  };

  const {
    validateForm,
    validateSingleField,
    setFieldTouched,
    getFieldError,
    hasFieldError,
    clearFieldError,
    hasAnyError,
  } = useFormValidation(validationRules);

  // Fetch Stripe configuration
  useEffect(() => {
    const fetchStripeConfig = async () => {
      try {
        const response = await fetch("/api/payments/stripe/config");
        const configData = await response.json();
        setStripeConfig({
          publishableKey: configData.publishableKey,
          demoMode: configData.demoMode || false,
        });
      } catch (error) {
        console.warn("Failed to fetch Stripe config:", error);
        setStripeConfig({ publishableKey: null, demoMode: true });
      }
    };

    fetchStripeConfig();
  }, []);

  // Load booking data from previous steps
  useEffect(() => {
    // Load booking data (most important)
    const savedBooking = localStorage.getItem("currentBooking");
    const savedRoute =
      localStorage.getItem("selectedRoute") ||
      localStorage.getItem("bookingRoute");
    const savedPassengers =
      localStorage.getItem("passengerData") ||
      localStorage.getItem("bookingPassengers");

    if (savedBooking) {
      try {
        const booking = JSON.parse(savedBooking);
        setBookingData(booking);
        console.log("Loaded booking data for payment:", booking);
      } catch (error) {
        console.error("Error parsing booking data:", error);
      }
    } else {
      // If no booking data, check if we have route and passenger data to reconstruct
      const savedRoute =
        localStorage.getItem("selectedRoute") ||
        localStorage.getItem("bookingRoute");
      const savedPassengers =
        localStorage.getItem("passengerData") ||
        localStorage.getItem("bookingPassengers");

      if (savedRoute && savedPassengers) {
        console.warn(
          "No currentBooking but have route/passenger data, redirecting to confirmation",
        );
        navigate("/userform/confirmation");
        return;
      } else {
        // No data at all, start from beginning
        console.warn(
          "No booking data found, redirecting to start of booking flow",
        );
        navigate("/userform/route");
        return;
      }
    }

    if (savedRoute) {
      try {
        setRouteData(JSON.parse(savedRoute));
      } catch (error) {
        console.error("Error parsing route data:", error);
      }
    }

    if (savedPassengers) {
      try {
        setPassengerData(JSON.parse(savedPassengers));
      } catch (error) {
        console.error("Error parsing passenger data:", error);
      }
    }

    // Load selected flight data
    const savedFlight = localStorage.getItem("selectedFlight");
    if (savedFlight) {
      try {
        const flight = JSON.parse(savedFlight);
        setSelectedFlight(flight);
        console.log("Loaded selected flight for payment:", flight);
      } catch (error) {
        console.error("Error parsing selected flight data:", error);
      }
    }

    // If user is logged in, pre-fill cardholder name
    if (user) {
      setPaymentDetails((prev) => ({
        ...prev,
        cardholderName: `${user.firstName} ${user.lastName}`,
      }));
    }

    // Note: Removed authentication check to support guest checkout
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formattedValue.length > 19) return; // Max length for formatted card number
    }

    // Format expiry date
    if (field === "expiryDate") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length >= 2) {
        formattedValue =
          formattedValue.substring(0, 2) + "/" + formattedValue.substring(2, 4);
      }
      if (formattedValue.length > 5) return;
    }

    // Format CVV (only numbers)
    if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 4) return;
    }

    setPaymentDetails((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    clearFieldError(field);
    setFieldTouched(field, true);

    // Validate field after a short delay
    setTimeout(() => {
      validateSingleField(field, formattedValue);
    }, 100);
  };

  const calculateTotal = () => {
    const passengerCount = passengerData?.passengers?.length || 1;

    // Use selected flight pricing if available
    if (selectedFlight && selectedFlight.price) {
      const flightPrice = parseFloat(selectedFlight.price.total);
      return flightPrice * passengerCount;
    }

    // Fallback to $15 per passenger
    return passengerCount * 15;
  };

  const getBasePrice = () => {
    if (selectedFlight && selectedFlight.price) {
      return parseFloat(selectedFlight.price.total);
    }
    return 10; // Fallback price
  };

  const getCurrency = () => {
    if (selectedFlight && selectedFlight.price) {
      return selectedFlight.price.currency;
    }
    return "USD"; // Fallback currency
  };

  const createBookingForStripe = async () => {
    if (bookingData) return; // Booking already created

    setLoading(true);
    setError("");

    try {
      // Validate required data first
      if (!routeData) {
        throw new Error(
          "Route information is missing. Please go back and select your route.",
        );
      }

      if (!passengerData?.passengers || passengerData.passengers.length === 0) {
        throw new Error(
          "Passenger information is missing. Please go back and add passenger details.",
        );
      }

      if (!passengerData.contactEmail && !user?.email) {
        throw new Error(
          "Contact email is required. Please provide a contact email.",
        );
      }

      // Transform route data to match booking API expectations
      const transformedRoute = {
        from: {
          code: routeData.from?.code || "",
          name: routeData.from?.name || "",
          city: routeData.from?.city || "",
          country: routeData.from?.country || "",
        },
        to: {
          code: routeData.to?.code || "",
          name: routeData.to?.name || "",
          city: routeData.to?.city || "",
          country: routeData.to?.country || "",
        },
        departureDate: routeData.departureDate,
        ...(routeData.returnDate && { returnDate: routeData.returnDate }),
        tripType: routeData.tripType || "oneway",
      };

      // Create booking first
      const bookingRequest = {
        route: transformedRoute,
        passengers: passengerData.passengers,
        contactEmail: passengerData.contactEmail || user?.email || "",
        termsAccepted: true,
        selectedFlight: selectedFlight,
        totalAmount: calculateTotal(),
      };

      console.log("Creating booking for Stripe payment:", bookingRequest);
      const bookingResponse = await authenticatedFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingRequest),
      });

      let bookingResult;

      if (!bookingResponse.ok) {
        let errorMessage = `Failed to create booking: ${bookingResponse.status} ${bookingResponse.statusText}`;

        try {
          const errorData = await bookingResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the default error message
        }

        console.error("Booking creation failed:", {
          status: bookingResponse.status,
          url: "/api/bookings",
        });

        throw new Error(errorMessage);
      }

      bookingResult = await bookingResponse.json();
      console.log("Booking created successfully for Stripe:", bookingResult);

      if (!bookingResult.success || !bookingResult.booking) {
        throw new Error(bookingResult.message || "Failed to create booking");
      }

      setBookingData(bookingResult.booking);
    } catch (err) {
      console.error("Booking creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  // Create booking when Stripe is selected
  useEffect(() => {
    if (
      selectedPaymentMethod === "stripe" &&
      routeData &&
      passengerData &&
      !bookingData
    ) {
      createBookingForStripe();
    }
  }, [selectedPaymentMethod, routeData, passengerData]);

  const handlePayPalPayment = async () => {
    setPaypalLoading(true);
    setError("");

    try {
      // Validate required data first
      if (!routeData) {
        throw new Error(
          "Route information is missing. Please go back and select your route.",
        );
      }

      if (!passengerData?.passengers || passengerData.passengers.length === 0) {
        throw new Error(
          "Passenger information is missing. Please go back and add passenger details.",
        );
      }

      if (!passengerData.contactEmail && !user?.email) {
        throw new Error(
          "Contact email is required. Please provide a contact email.",
        );
      }

      // Transform route data to match booking API expectations
      const transformedRoute = {
        from: {
          code: routeData.from?.code || "",
          name: routeData.from?.name || "",
          city: routeData.from?.city || "",
          country: routeData.from?.country || "",
        },
        to: {
          code: routeData.to?.code || "",
          name: routeData.to?.name || "",
          city: routeData.to?.city || "",
          country: routeData.to?.country || "",
        },
        departureDate: routeData.departureDate,
        ...(routeData.returnDate && { returnDate: routeData.returnDate }),
        tripType: routeData.tripType || "oneway",
      };

      console.log("Creating booking with data:", {
        route: transformedRoute,
        passengers: passengerData.passengers,
        contactEmail: passengerData.contactEmail || user?.email,
        passengerCount: passengerData.passengers.length,
      });

      // Create booking first
      const bookingRequest = {
        route: transformedRoute,
        passengers: passengerData.passengers,
        contactEmail: passengerData.contactEmail || user?.email || "",
        termsAccepted: true,
        selectedFlight: selectedFlight,
        totalAmount: calculateTotal(),
      };

      console.log("Sending booking request to /api/bookings...");
      const bookingResponse = await authenticatedFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingRequest),
      });

      console.log("Booking response status:", bookingResponse.status);

      let bookingResult;

      if (!bookingResponse.ok) {
        let errorMessage = `Failed to create booking: ${bookingResponse.status} ${bookingResponse.statusText}`;

        try {
          const errorData = await bookingResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the default error message
        }

        console.error("Booking creation failed:", {
          status: bookingResponse.status,
          statusText: bookingResponse.statusText,
          url: "/api/bookings",
          requestData: bookingRequest,
        });

        throw new Error(errorMessage);
      }

      bookingResult = await bookingResponse.json();
      console.log("Booking created successfully:", bookingResult);

      if (!bookingResult.success || !bookingResult.booking) {
        throw new Error(bookingResult.message || "Failed to create booking");
      }

      const booking = bookingResult.booking;

      // Create PayPal order
      const paypalOrderResponse = await authenticatedFetch(
        "/api/payments/paypal/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            bookingId: booking.id,
            amount: calculateTotal(),
            currency: "USD",
          }),
        },
      );

      let paypalOrderData;

      if (!paypalOrderResponse.ok) {
        let errorMessage = `Failed to create PayPal order: ${paypalOrderResponse.status} ${paypalOrderResponse.statusText}`;

        try {
          const errorData = await paypalOrderResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the default error message
        }

        console.error("PayPal order creation failed:", {
          status: paypalOrderResponse.status,
          statusText: paypalOrderResponse.statusText,
        });

        throw new Error(errorMessage);
      }

      paypalOrderData = await paypalOrderResponse.json();
      console.log("PayPal order created:", paypalOrderData);

      const { orderID, approvalUrl, demoMode, message } = paypalOrderData;

      if (!approvalUrl) {
        throw new Error("PayPal approval URL not received");
      }

      // Show demo mode info if applicable
      if (demoMode) {
        setError(
          `Demo Mode: ${message || "PayPal payment simulation. This will redirect to a success page."}`,
        );
        // Still redirect to show the flow
        setTimeout(() => {
          window.location.href = approvalUrl;
        }, 2000);
      } else {
        // Redirect to PayPal for approval
        window.location.href = approvalUrl;
      }
    } catch (err) {
      console.error("PayPal payment error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing PayPal payment. Please try again.",
      );
    } finally {
      setPaypalLoading(false);
    }
  };

  const handlePayment = async () => {
    // Set all fields as touched for validation
    Object.keys(paymentDetails).forEach((field) => {
      setFieldTouched(field, true);
    });

    const isValid = validateForm(paymentDetails);

    if (!isValid) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Validate required data first
      if (!routeData) {
        throw new Error(
          "Route information is missing. Please go back and select your route.",
        );
      }

      if (!passengerData?.passengers || passengerData.passengers.length === 0) {
        throw new Error(
          "Passenger information is missing. Please go back and add passenger details.",
        );
      }

      // Transform route data to match booking API expectations
      const transformedRoute = {
        from: {
          code: routeData.from?.code || "",
          name: routeData.from?.name || "",
          city: routeData.from?.city || "",
          country: routeData.from?.country || "",
        },
        to: {
          code: routeData.to?.code || "",
          name: routeData.to?.name || "",
          city: routeData.to?.city || "",
          country: routeData.to?.country || "",
        },
        departureDate: routeData.departureDate,
        ...(routeData.returnDate && { returnDate: routeData.returnDate }),
        tripType: routeData.tripType || "oneway",
      };

      // Create booking first
      const bookingRequest = {
        route: transformedRoute,
        passengers: passengerData.passengers,
        contactEmail: passengerData.contactEmail || user?.email || "",
        termsAccepted: true,
        selectedFlight: selectedFlight,
        totalAmount: calculateTotal(),
      };

      const bookingResponse = await authenticatedFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingRequest),
      });

      if (!bookingResponse.ok) {
        throw new Error("Failed to create booking");
      }

      const bookingResult = await bookingResponse.json();

      if (!bookingResult.success || !bookingResult.booking) {
        throw new Error(bookingResult.message || "Failed to create booking");
      }

      const booking = bookingResult.booking;

      // Process payment
      const paymentRequest: PaymentRequest = {
        bookingId: booking.id,
        paymentMethod: selectedPaymentMethod as "card" | "paypal",
        paymentDetails:
          selectedPaymentMethod === "card"
            ? {
                cardNumber: paymentDetails.cardNumber.replace(/\s/g, ""),
                expiryDate: paymentDetails.expiryDate,
                cvv: paymentDetails.cvv,
                cardholderName: paymentDetails.cardholderName,
                country: paymentDetails.country,
              }
            : {},
      };

      const paymentResponse = await authenticatedFetch("/api/payments", {
        method: "POST",
        body: JSON.stringify(paymentRequest),
      });

      if (!paymentResponse.ok) {
        throw new Error("Payment failed");
      }

      const paymentResult: PaymentResponse = await paymentResponse.json();

      if (paymentResult.success) {
        setSuccess(true);

        // Clear stored data
        localStorage.removeItem("selectedRoute");
        localStorage.removeItem("passengerData");

        // Redirect to thank you page after short delay
        setTimeout(() => {
          navigate("/userform/thankyou");
        }, 2000);
      } else {
        setError(paymentResult.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        "An error occurred while processing your payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen bg-ob-background font-plus-jakarta">
      {/* Header */}
      <header className="text-left">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="/onboard/result.png"
            alt="OnboardTicket Logo"
            className="h-8 sm:h-10 lg:h-12 w-auto max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] cursor-pointer"
            loading="eager"
            onClick={() => navigate("/")}
          />
        </div>
      </header>

      {/* Payment Header Section */}
      <div className="bg-[#505BFB] py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-8 lg:mb-12">
                Secure Payment
              </h1>
              <div className="space-y-2 text-white">
                {selectedFlight && (
                  <div className="mb-4 p-3 bg-white/10 rounded-lg">
                    <div className="text-sm text-white/90 mb-1">
                      Selected Flight
                    </div>
                    <div className="text-xs text-white/70">
                      {selectedFlight.validatingAirlineCodes?.[0]} •{" "}
                      {getCurrency()}{" "}
                      {parseInt(
                        selectedFlight.price?.total || "0",
                      ).toLocaleString()}{" "}
                      per person
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-8">
                  <span className="text-lg lg:text-xl font-bold">
                    Base Price:
                  </span>
                  <span className="text-xl lg:text-2xl font-bold">
                    {getCurrency()}
                    {getBasePrice().toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-lg lg:text-xl font-bold">
                    Passengers:
                  </span>
                  <span className="text-xl lg:text-2xl font-bold">
                    {passengerData?.passengers?.length || 1}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-lg lg:text-xl font-bold">TOTAL:</span>
                  <span className="text-xl lg:text-2xl font-bold">
                    {getCurrency()}
                    {calculateTotal().toFixed(2)}
                  </span>
                </div>
                {routeData && (
                  <div className="flex items-center gap-8">
                    <span className="text-lg lg:text-xl font-bold">Route:</span>
                    <span className="text-xl lg:text-2xl font-bold">
                      {routeData.from?.city} → {routeData.to?.city}
                    </span>
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 mt-4 text-green-200">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">
                  256-bit SSL Encrypted
                </span>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-3 px-6 py-3 bg-[#C6FF9A] text-[#766868] font-bold text-lg rounded-full hover:bg-green-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-12 lg:py-20">
        <section className="bg-white/90 rounded-3xl p-8 lg:p-16 shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Lock className="w-6 h-6 text-[#505BFB]" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ob-primary leading-tight text-center">
              Secure Payment
            </h1>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-green-600 text-2xl font-bold mb-2">
                Payment Successful!
              </div>
              <p className="text-green-700">
                Your booking has been confirmed. Redirecting to confirmation
                page...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 font-medium">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="text-[#23235B] text-lg lg:text-xl font-semibold leading-relaxed mb-8">
            {/* Payment Method Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {[
                {
                  key: "stripe",
                  label: stripeConfig.demoMode
                    ? "Stripe (Demo Mode)"
                    : "Stripe (Recommended)",
                  icon: Zap,
                  disabled: false,
                },
                { key: "card", label: "Credit Card", icon: CreditCard, disabled: false },
                { key: "paypal", label: "PayPal", icon: null, disabled: false },
              ].map((method) => (
                <div key={method.key} className="flex-1">
                  <button
                    onClick={() => setSelectedPaymentMethod(method.key)}
                    disabled={loading || success || method.disabled}
                    className={`w-full px-6 py-4 rounded-lg border-2 font-bold text-lg transition-colors flex items-center justify-center gap-2 ${
                      selectedPaymentMethod === method.key
                        ? "bg-[#505BFB] border-[#505BFB] text-white shadow-lg"
                        : "bg-[#EBECFF] border-white text-[#848484] hover:bg-white"
                    } ${loading || success || method.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {method.icon && <method.icon className="w-5 h-5" />}
                    {method.label}
                  </button>
                  {method.key === "stripe" && stripeConfig.demoMode && (
                    <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1 mt-2 text-center font-medium">
                      Demo Mode: Stripe demo mode - credentials not configured
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Payment Form - Only show for card payments */}
            {selectedPaymentMethod === "card" && !success && (
              <div className="space-y-6">
                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-[#637996] mb-2">
                    Country *
                  </label>
                  <select
                    value={paymentDetails.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    onBlur={() => setFieldTouched("country", true)}
                    disabled={loading}
                    className={`w-full px-6 py-4 rounded-lg border bg-white text-[#20242A] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#505BFB] ${
                      hasFieldError("country")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {hasFieldError("country") && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError("country")}</span>
                    </div>
                  )}
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#637996] mb-2">
                    Name on Card *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter cardholder name"
                    value={paymentDetails.cardholderName}
                    onChange={(e) =>
                      handleInputChange("cardholderName", e.target.value)
                    }
                    onBlur={() => setFieldTouched("cardholderName", true)}
                    disabled={loading}
                    className={`w-full px-6 py-4 rounded-lg border bg-white text-[#20242A] font-bold text-lg placeholder:text-[#84848470] focus:outline-none focus:ring-2 focus:ring-[#505BFB] ${
                      hasFieldError("cardholderName")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {hasFieldError("cardholderName") && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError("cardholderName")}</span>
                    </div>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-semibold text-[#637996] mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber}
                    onChange={(e) =>
                      handleInputChange("cardNumber", e.target.value)
                    }
                    onBlur={() => setFieldTouched("cardNumber", true)}
                    disabled={loading}
                    className={`w-full px-6 py-4 rounded-lg border bg-white text-[#20242A] font-bold text-lg placeholder:text-[#84848470] focus:outline-none focus:ring-2 focus:ring-[#505BFB] ${
                      hasFieldError("cardNumber")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {hasFieldError("cardNumber") && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError("cardNumber")}</span>
                    </div>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#637996] mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentDetails.expiryDate}
                      onChange={(e) =>
                        handleInputChange("expiryDate", e.target.value)
                      }
                      onBlur={() => setFieldTouched("expiryDate", true)}
                      disabled={loading}
                      className={`w-full px-6 py-4 rounded-lg border bg-white text-[#20242A] font-bold text-lg placeholder:text-[#84848470] focus:outline-none focus:ring-2 focus:ring-[#505BFB] ${
                        hasFieldError("expiryDate")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {hasFieldError("expiryDate") && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{getFieldError("expiryDate")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#637996] mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentDetails.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value)}
                      onBlur={() => setFieldTouched("cvv", true)}
                      disabled={loading}
                      className={`w-full px-6 py-4 rounded-lg border bg-white text-[#20242A] font-bold text-lg placeholder:text-[#84848470] focus:outline-none focus:ring-2 focus:ring-[#505BFB] ${
                        hasFieldError("cvv")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {hasFieldError("cvv") && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{getFieldError("cvv")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">
                      Your payment is secure
                    </span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    All payment information is encrypted and processed securely.
                    We never store your card details.
                  </p>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePayment}
                  disabled={loading || hasAnyError() || success}
                  className={`w-full py-4 font-bold text-xl rounded-xl transition-colors shadow-lg mt-8 ${
                    loading || hasAnyError() || success
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-[#505BFB] text-white hover:bg-blue-600"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `PAY ${getCurrency()}${calculateTotal().toFixed(2)}`
                  )}
                </button>
              </div>
            )}

            {/* Stripe Payment */}
            {selectedPaymentMethod === "stripe" && !success && (
              <div className="space-y-6">
                {/* Stripe Info */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-700">
                        Stripe Payment
                      </h3>
                      <p className="text-sm text-purple-600">
                        Fast, secure, and trusted worldwide
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 border border-purple-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        Total Amount:
                      </span>
                      <span className="font-bold text-xl text-purple-600">
                        {getCurrency()}
                        {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                      <span>Passengers:</span>
                      <span>{passengerData?.passengers?.length || 1}</span>
                    </div>
                  </div>

                  {bookingData && (
                    <StripePaymentForm
                      amount={calculateTotal()}
                      currency={getCurrency().replace("$", "") || "USD"}
                      bookingId={bookingData.id}
                      onSuccess={(paymentIntentId) => {
                        console.log(
                          "Stripe payment successful:",
                          paymentIntentId,
                        );
                        setSuccess(true);
                        setTimeout(() => {
                          navigate("/payment/success");
                        }, 1500);
                      }}
                      onError={(error) => {
                        setError(error);
                      }}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  )}
                </div>
              </div>
            )}

            {/* PayPal Payment */}
            {selectedPaymentMethod === "paypal" && !success && (
              <div className="space-y-6">
                {/* PayPal Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#0070ba] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">PP</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#0070ba]">
                        PayPal
                      </h3>
                      <p className="text-sm text-blue-600">
                        Secure payment with PayPal
                      </p>
                    </div>
                  </div>

                  <p className="text-blue-700 mb-4">
                    You will be redirected to PayPal to complete your payment
                    securely.
                  </p>

                  <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        Total Amount:
                      </span>
                      <span className="font-bold text-xl text-[#0070ba]">
                        {getCurrency()}
                        {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                      <span>Passengers:</span>
                      <span>{passengerData?.passengers?.length || 1}</span>
                    </div>
                  </div>
                </div>

                {/* PayPal Button */}
                <button
                  onClick={handlePayPalPayment}
                  disabled={paypalLoading}
                  className={`w-full py-4 font-bold text-xl rounded-xl transition-colors shadow-lg ${
                    paypalLoading
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-[#0070ba] text-white hover:bg-[#005ea6]"
                  }`}
                >
                  {paypalLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Redirecting to PayPal...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>Pay with PayPal</span>
                      <span className="text-lg">
                        {getCurrency()}
                        {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  )}
                </button>

                {/* Security Notice */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Secure PayPal Payment</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    Your payment is protected by PayPal's Buyer Protection. You
                    can pay with your PayPal balance, bank account, or credit
                    card.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 px-4 sm:px-8 lg:px-36">
        <div className="bg-ticket-footer rounded-t-lg p-8 lg:p-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {/* Logo and Copyright */}
            <div className="space-y-4">
              <div>
                <img
                  src="/onboard/result.png"
                  alt="OnboardTicket Logo"
                  className="h-12 sm:h-14 md:h-16 w-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] object-contain mb-4 cursor-pointer"
                  onClick={() => navigate("/")}
                />
                <hr className="border-white mb-4" />
                <div className="text-base font-semibold text-[#3150DA]">
                  Onboardticket.com
                </div>
                <div className="text-xs opacity-80 mt-2 text-black">
                  © 2025 — Copyright
                </div>
              </div>
              <p className="text-xs opacity-80 leading-relaxed text-black">
                OnboardTicket is committed to upholding the highest standards in
                compliance with international civil aviation regulations and
                ethical booking practices. This includes, but is not limited to,
                strict avoidance of misuse of booking classes, fraudulent
                activities, duplicate, speculative, or fictitious reservations.
                Users who engage in repeated cancellations without legitimate
                intent will be subject to monitoring, and may face usage
                restrictions or permanent bans from our platform.
              </p>
            </div>
            {/* About */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center justify-center text-left">
              <h4 className="text-base md:text-lg font-bold text-[#3150DA]">
                About
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-black">
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/about")}
                >
                  Who We are ?
                </li>
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/privacy-policy")}
                >
                  Privacy Policy
                </li>
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/terms-conditions")}
                >
                  Terms & Conditions
                </li>
              </ul>
            </div>
            {/* Get Help */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center justify-center text-left">
              <h4 className="text-base md:text-lg font-bold text-[#3150DA]">
                Get Help
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-black">
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/faq")}
                >
                  FAQs
                </li>
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/payment")}
                >
                  Payment
                </li>
                <li
                  className="cursor-pointer hover:text-[#3839C9]"
                  onClick={() => navigate("/contact")}
                >
                  Contact Support 24/7
                </li>
              </ul>
            </div>
            {/* Follow Us */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center justify-center text-left">
              <h4 className="text-base md:text-lg font-bold text-[#3150DA]">
                Follow US
              </h4>
              <div className="space-y-1 md:space-y-2">
                <h5 className="text-base md:text-lg font-bold text-[#3150DA]">
                  Stay in touch
                </h5>
                <p className="text-xs sm:text-sm font-semibold text-black">
                  Blog
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
