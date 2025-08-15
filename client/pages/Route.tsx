import { useState, useEffect } from "react";
import { ArrowRight, Plane, ChevronDown, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DatePicker from "../components/DatePicker";
import SearchableSelect from "../components/ui/SearchableSelect";
import {
  useFormValidation,
  CommonValidationRules,
} from "../hooks/useFormValidation";
import { Airport, FlightRoute } from "@shared/api";
import { getSafeSupabase } from "../lib/supabaseSafe";

interface RouteProps {
  onNext: () => void;
  currentStep: string;
  onNavigate: (step: any) => void;
}

export default function Route({ onNext, currentStep, onNavigate }: RouteProps) {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchingFlights, setSearchingFlights] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(true);
  const [passengerData, setPassengerData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form validation
  const validationRules = {
    fromLocation: [
      { required: true, message: "Please select a departure airport" },
    ],
    toLocation: [
      { required: true, message: "Please select a destination airport" },
      {
        custom: (value: string) => value !== fromLocation,
        message: "Destination must be different from departure",
      },
    ],
    departureDate: CommonValidationRules.date,
    ...(tripType === "roundtrip" && {
      returnDate: [
        ...CommonValidationRules.date,
        {
          custom: (value: string) => {
            if (!value || !departureDate) return true;
            return new Date(value) > new Date(departureDate);
          },
          message: "Return date must be after departure date",
        },
      ],
    }),
  };

  const {
    validateForm,
    validateSingleField,
    setFieldTouched,
    getFieldError,
    hasFieldError,
    clearFieldError,
  } = useFormValidation(validationRules);

  // Load airports from API and restore form data
  useEffect(() => {
    const loadAirports = async () => {
      try {
        setLoadingAirports(true);
        const { supabaseHelpers } = await getSafeSupabase();
        const { data, error } = await supabaseHelpers.getAirports();
        if (!error && data && data.length > 0) {
          setAirports(data);
        } else {
          console.log("No airports found in database");
          setAirports([]);
        }
      } catch (error) {
        console.log("Failed to load airports from database:", error);
        setAirports([]);
      } finally {
        setLoadingAirports(false);
      }
    };

    const restoreFormData = () => {
      try {
        const savedRoute = localStorage.getItem("bookingRoute");
        if (savedRoute) {
          const routeData = JSON.parse(savedRoute);
          setTripType(routeData.tripType || "oneway");
          setFromLocation(routeData.from?.code || "");
          setToLocation(routeData.to?.code || "");
          setDepartureDate(routeData.departureDate || "");
          setReturnDate(routeData.returnDate || "");
        }
      } catch (error) {
        console.log("Error restoring form data:", error);
      }
    };

    const setDefaultDates = () => {
      // Only set default dates if no saved data
      const savedRoute = localStorage.getItem("bookingRoute");
      if (!savedRoute) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultDate = tomorrow.toISOString().split("T")[0];
        setDepartureDate(defaultDate);

        if (tripType === "roundtrip") {
          const weekLater = new Date();
          weekLater.setDate(weekLater.getDate() + 8);
          setReturnDate(weekLater.toISOString().split("T")[0]);
        }
      }
    };

    loadAirports();
    restoreFormData();
    setDefaultDates();
  }, []);

  // Load passenger data and listen for changes
  useEffect(() => {
    const loadPassengerData = () => {
      try {
        const savedPassengers = localStorage.getItem("bookingPassengers");
        const savedContactEmail = localStorage.getItem("bookingContactEmail");
        if (savedPassengers || savedContactEmail) {
          setPassengerData({
            passengers: savedPassengers ? JSON.parse(savedPassengers) : [],
            contactEmail: savedContactEmail || "",
          });
        }
      } catch (error) {
        console.log("Error loading passenger data:", error);
      }
    };

    // Load initial data
    loadPassengerData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bookingPassengers" || e.key === "bookingContactEmail") {
        loadPassengerData();
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update return date when trip type changes
  useEffect(() => {
    if (tripType === "roundtrip" && !returnDate && departureDate) {
      const depDate = new Date(departureDate);
      depDate.setDate(depDate.getDate() + 7);
      setReturnDate(depDate.toISOString().split("T")[0]);
    }
  }, [tripType, departureDate]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (fromLocation || toLocation || departureDate || returnDate) {
      const fromAirport = airports.find((a) => a.code === fromLocation);
      const toAirport = airports.find((a) => a.code === toLocation);

      const routeData: FlightRoute = {
        from: fromAirport || {
          code: fromLocation,
          name: "",
          city: "",
          country: "",
        },
        to: toAirport || { code: toLocation, name: "", city: "", country: "" },
        departureDate,
        returnDate: tripType === "roundtrip" ? returnDate : undefined,
        tripType,
      };

      localStorage.setItem("bookingRoute", JSON.stringify(routeData));
    }
  }, [fromLocation, toLocation, departureDate, returnDate, tripType, airports]);

  const handleLocationChange = (
    field: "fromLocation" | "toLocation",
    value: string,
  ) => {
    if (field === "fromLocation") {
      setFromLocation(value);
      // If destination is same as new departure, clear it
      if (toLocation === value) {
        setToLocation("");
      }
    } else {
      setToLocation(value);
    }

    clearFieldError(field);
    setFieldTouched(field, true);

    // Validate on change
    setTimeout(() => {
      validateSingleField(field, value);
    }, 100);
  };

  const handleDateChange = (
    field: "departureDate" | "returnDate",
    value: string,
  ) => {
    if (field === "departureDate") {
      setDepartureDate(value);
      // If return date is before new departure date, adjust it
      if (
        tripType === "roundtrip" &&
        returnDate &&
        new Date(value) >= new Date(returnDate)
      ) {
        const newReturnDate = new Date(value);
        newReturnDate.setDate(newReturnDate.getDate() + 1);
        setReturnDate(newReturnDate.toISOString().split("T")[0]);
      }
    } else {
      setReturnDate(value);
    }

    clearFieldError(field);
    setFieldTouched(field, true);

    // Validate on change
    setTimeout(() => {
      validateSingleField(field, value);
    }, 100);
  };

  const handleNext = async () => {
    const formData = {
      fromLocation,
      toLocation,
      departureDate,
      ...(tripType === "roundtrip" && { returnDate }),
    };

    // Set all fields as touched for validation display
    Object.keys(formData).forEach((field) => {
      setFieldTouched(field, true);
    });

    const isValid = validateForm(formData);

    if (!isValid) {
      return;
    }

    // Check that we have valid airports
    const fromAirport = airports.find((a) => a.code === fromLocation);
    const toAirport = airports.find((a) => a.code === toLocation);

    if (!fromAirport || !toAirport) {
      console.error("Invalid airport selection");
      return;
    }

    setLoading(true);
    setSearchingFlights(true);

    try {
      // Simulate API call to search for flights
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store complete route data in localStorage for persistence across steps
      const routeData: FlightRoute = {
        tripType,
        from: fromAirport,
        to: toAirport,
        departureDate,
        returnDate: tripType === "roundtrip" ? returnDate : undefined,
      };

      // Save to both keys for compatibility
      localStorage.setItem("selectedRoute", JSON.stringify(routeData));
      localStorage.setItem("bookingRoute", JSON.stringify(routeData));

      console.log("Route data saved:", routeData);
      onNext();
    } catch (error) {
      console.error("Error processing route:", error);
      // Still allow progression for demo purposes
      onNext();
    } finally {
      setLoading(false);
      setSearchingFlights(false);
    }
  };

  const getSelectedAirport = (code: string): Airport | undefined => {
    return airports.find((airport) => airport.code === code);
  };

  return (
    <div className="min-h-screen bg-ticket-primary text-white">
      <div className="px-4 sm:px-8 lg:px-36">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 mb-12">
          <div className="flex items-center gap-4">
            <button className="text-2xl font-bold">Route</button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("passengers")}
              className="text-2xl font-bold text-white/60 hover:text-white transition-colors"
            >
              Passangers
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("confirmation")}
              className="text-2xl font-bold text-white/60 hover:text-white transition-colors"
            >
              Confirmation
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex items-center">
            <div className="h-1 bg-ticket-accent w-56"></div>
            <div className="h-1 bg-ticket-secondary flex-1"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Left Side - Form */}
          <div className="space-y-8">
            {/* Trip Type Selection */}
            <div>
              <h2 className="text-2xl font-bold mb-8 text-[#F6F6FF]">Route</h2>

              <div className="flex gap-0 mb-8 max-w-md">
                <button
                  onClick={() => setTripType("oneway")}
                  className={`flex-1 py-3 px-6 text-sm font-semibold rounded-l-lg transition-colors ${
                    tripType === "oneway"
                      ? "bg-ticket-dark text-white"
                      : "bg-ticket-secondary text-white"
                  }`}
                >
                  One way
                </button>
                <button
                  onClick={() => setTripType("roundtrip")}
                  className={`flex-1 py-3 px-6 text-sm font-semibold rounded-r-lg transition-colors ${
                    tripType === "roundtrip"
                      ? "bg-ticket-dark text-white"
                      : "bg-ticket-secondary text-white"
                  }`}
                >
                  Round Trip
                </button>
              </div>
            </div>

            {/* Route Selection */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-[#F6F6FF]">Route</h3>

              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#F6F6FF] mb-2">
                      From (Departure Airport)
                    </label>
                    <SearchableSelect
                      options={airports.map((airport) => ({
                        value: airport.code,
                        label: `${airport.city} (${airport.code})`,
                        description: airport.name,
                      }))}
                      value={fromLocation}
                      onChange={(value) =>
                        handleLocationChange("fromLocation", value)
                      }
                      onBlur={() => setFieldTouched("fromLocation", true)}
                      placeholder={
                        loadingAirports
                          ? "Loading airports..."
                          : "Select departure airport"
                      }
                      disabled={loadingAirports}
                      error={hasFieldError("fromLocation")}
                      errorMessage={getFieldError("fromLocation")}
                    />
                  </div>

                  <div className="bg-ticket-secondary rounded p-3 mt-6">
                    <Plane className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#F6F6FF] mb-2">
                      To (Destination Airport)
                    </label>
                    <SearchableSelect
                      options={airports
                        .filter((airport) => airport.code !== fromLocation)
                        .map((airport) => ({
                          value: airport.code,
                          label: `${airport.city} (${airport.code})`,
                          description: airport.name,
                        }))}
                      value={toLocation}
                      onChange={(value) =>
                        handleLocationChange("toLocation", value)
                      }
                      onBlur={() => setFieldTouched("toLocation", true)}
                      placeholder={
                        loadingAirports
                          ? "Loading airports..."
                          : "Select destination airport"
                      }
                      disabled={loadingAirports}
                      error={hasFieldError("toLocation")}
                      errorMessage={getFieldError("toLocation")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-[#F6F6FF]">
                Travel Dates
              </h3>

              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-1 space-y-3">
                    <label className="block text-sm font-semibold text-[#F6F6FF]">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) =>
                        handleDateChange("departureDate", e.target.value)
                      }
                      onBlur={() => setFieldTouched("departureDate", true)}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full bg-white border rounded-lg p-4 text-gray-600 text-base ${
                        hasFieldError("departureDate")
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {hasFieldError("departureDate") && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{getFieldError("departureDate")}</span>
                      </div>
                    )}
                  </div>

                  {tripType === "roundtrip" && (
                    <>
                      <div className="bg-ticket-secondary rounded-lg p-3 flex items-center justify-center mt-8">
                        <svg
                          className="w-5 h-5 text-white"
                          viewBox="0 0 19 15"
                          fill="currentColor"
                        >
                          <path d="M19 4.14235V15.0009H8.12981C7.78726 14.8159 7.65846 14.5352 7.6813 14.1517C7.70596 13.7347 7.68587 13.3142 7.68678 12.8963C7.68861 12.215 7.85394 12.0525 8.54817 12.0516C10.6948 12.0507 12.8405 12.0534 14.9872 12.0498C15.6924 12.0489 15.9874 11.7601 15.9901 11.0697C15.9947 9.93352 15.992 8.7973 15.9911 7.66019C15.9911 6.74057 15.7353 6.48788 14.7999 6.48697C12.1518 6.48607 9.50274 6.48697 6.85462 6.48697C6.70846 6.48697 6.56231 6.48697 6.38053 6.48697C6.38053 7.47338 6.39058 8.39841 6.37231 9.32345C6.36774 9.52921 6.26178 9.73317 6.2024 9.93713C6.00692 9.84688 5.78221 9.79183 5.6187 9.66187C3.89957 8.30275 2.18774 6.9355 0.480481 5.56194C0.297788 5.41484 0.158942 5.21449 0 5.03941C0 4.97984 0 4.91938 0 4.85982C0.176298 4.68022 0.338894 4.48439 0.531635 4.32284C0.97101 3.95554 1.425 3.60448 1.87351 3.2471C3.14687 2.23001 4.41659 1.20931 5.69909 0.203056C5.83793 0.0938572 6.04163 0.0658805 6.21519 0C6.27 0.175982 6.36683 0.351062 6.37322 0.528849C6.3924 1.15517 6.38053 1.78238 6.38053 2.4096C6.38053 2.79225 6.38053 3.174 6.38053 3.59274C6.62351 3.59274 6.80346 3.59274 6.98341 3.59274C10.7067 3.59274 14.4309 3.59726 18.1541 3.58643C18.5926 3.58552 18.8822 3.71638 19 4.14235Z" />
                        </svg>
                      </div>
                      <div className="flex-1 space-y-3">
                        <label className="block text-sm font-semibold text-[#F6F6FF]">
                          Return Date
                        </label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) =>
                            handleDateChange("returnDate", e.target.value)
                          }
                          onBlur={() => setFieldTouched("returnDate", true)}
                          min={
                            departureDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          className={`w-full bg-white border rounded-lg p-4 text-gray-600 text-base ${
                            hasFieldError("returnDate")
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {hasFieldError("returnDate") && (
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{getFieldError("returnDate")}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Button */}
            <div className="flex justify-start">
              <button
                onClick={handleNext}
                disabled={loading}
                className={`rounded-full w-20 h-12 flex items-center justify-center transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-ticket-accent hover:bg-opacity-80"
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                ) : (
                  <ArrowRight className="w-6 h-6 text-black" />
                )}
              </button>
            </div>

            {/* Flight Search Status */}
            {searchingFlights && (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-white font-medium">
                    Searching for available flights...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Ticket Preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-lg p-8 shadow-2xl w-full max-w-sm">
              {/* Ticket Header */}
              <div className="bg-ticket-darker h-16 -mx-8 -mt-8 mb-6 flex items-center justify-center rounded-t-lg">
                <ArrowRight className="w-8 h-8 text-black" />
              </div>

              {/* Route Information */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-black">
                      ({fromLocation || "---"})
                    </div>
                    <div className="text-xs font-semibold text-ticket-gray">
                      {getSelectedAirport(fromLocation)?.city ||
                        "Select departure"}
                    </div>
                    <div className="text-xs text-ticket-gray-light">
                      {departureDate
                        ? new Date(departureDate).toLocaleDateString()
                        : "20/05/2025"}
                    </div>
                  </div>
                  <ArrowRight className="w-8 h-8 text-black" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-black">
                      ({toLocation || "---"})
                    </div>
                    <div className="text-xs font-semibold text-ticket-gray">
                      {getSelectedAirport(toLocation)?.city ||
                        "Select destination"}
                    </div>
                    <div className="text-xs text-ticket-gray-light">
                      {tripType === "roundtrip" && returnDate
                        ? new Date(returnDate).toLocaleDateString()
                        : "30/05/2025"}
                    </div>
                  </div>
                </div>
                {tripType === "roundtrip" && (
                  <div className="text-xs text-ticket-gray-light">
                    Round trip •{" "}
                    {departureDate && returnDate
                      ? `${Math.ceil((new Date(returnDate).getTime() - new Date(departureDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                      : "Duration TBD"}
                  </div>
                )}
              </div>

{(() => {
                // Get current passenger data from state or localStorage
                let passengers = [];
                let contactEmail = "";

                if (passengerData) {
                  passengers = passengerData.passengers || [];
                  contactEmail = passengerData.contactEmail || "";
                } else {
                  // Fallback to localStorage (for immediate access)
                  try {
                    const savedPassengers = localStorage.getItem("bookingPassengers");
                    const savedContactEmail = localStorage.getItem("bookingContactEmail");
                    if (savedPassengers) {
                      passengers = JSON.parse(savedPassengers);
                    }
                    if (savedContactEmail) {
                      contactEmail = savedContactEmail;
                    }
                  } catch (error) {
                    console.log("Error parsing passenger data:", error);
                  }
                }

                return (
                  /* Passenger Info */
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-ticket-text mb-1">
                      Passenger{passengers.length > 1 ? "s" : ""} / {passengers.length || 1}
                    </div>
                    {passengers.length > 0 ? (
                      passengers.slice(0, 2).map((passenger, index) => (
                        <div key={index} className="mb-4 last:mb-0">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-ticket-text font-semibold">
                                Passenger {index + 1}
                              </div>
                              <div className="font-bold">
                                {passenger.title || "Mr"}.{" "}
                                {passenger.firstName || "First"}{" "}
                                {passenger.lastName || "Last"}
                              </div>
                            </div>
                            <div>
                              <div className="text-ticket-text font-semibold">Flight</div>
                              <div className="font-bold">$15 USD</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                            <div>
                              <div className="text-ticket-text font-semibold">Seat</div>
                              <div className="font-bold">{20 + index}C</div>
                            </div>
                            <div>
                              <div className="text-ticket-text font-semibold">
                                Departure
                              </div>
                              <div className="font-bold">7:30 AM</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-ticket-text font-semibold">
                            Passenger
                          </div>
                          <div className="font-bold">Mr. Passenger Name</div>
                        </div>
                        <div>
                          <div className="text-ticket-text font-semibold">Flight</div>
                          <div className="font-bold">$15 USD</div>
                        </div>
                      </div>
                    )}
                    {passengers.length > 2 && (
                      <div className="text-xs text-ticket-gray-light mt-2">
                        + {passengers.length - 2} more passenger
                        {passengers.length - 2 > 1 ? "s" : ""}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>
                        <div className="text-ticket-text font-semibold">Seat</div>
                        <div className="font-bold">20C</div>
                      </div>
                      <div>
                        <div className="text-ticket-text font-semibold">
                          Departure
                        </div>
                        <div className="font-bold">7:30 AM</div>
                      </div>
                    </div>
                    {contactEmail && (
                      <div className="text-xs text-ticket-gray-light mt-3">
                        Contact: {contactEmail}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Barcode */}
              <div className="flex justify-center">
                <div className="flex gap-1">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-black"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  className="w-40 h-10 mb-4 cursor-pointer"
                  onClick={() => navigate("/")}
                />
                <hr className="border-white mb-4" />
                <div className="text-base font-semibold text-white">
                  Onboardticket.com
                </div>
                <div className="text-xs opacity-80 mt-2 text-white">
                  © 2025 — Copyright
                </div>
              </div>
              <p className="text-xs opacity-80 leading-relaxed text-white">
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
            <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center md:justify-center">
              <h4 className="text-base md:text-lg font-bold text-white">
                About
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-white">
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
            <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center md:justify-center">
              <h4 className="text-base md:text-lg font-bold text-white">
                Get Help
              </h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-white">
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
            <div className="space-y-2 md:space-y-4 flex flex-col items-start md:items-center md:justify-center">
              <h4 className="text-base md:text-lg font-bold text-white">
                Follow US
              </h4>

              <div className="space-y-1 md:space-y-2">
                <h5 className="text-base md:text-lg font-bold text-white">
                  Stay in touch
                </h5>
                <p className="text-xs sm:text-sm font-semibold text-white">
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
