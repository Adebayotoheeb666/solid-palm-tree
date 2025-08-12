import { useState, useEffect } from "react";
import { Plus, ArrowRight, Mail, AlertCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useFormValidation,
  CommonValidationRules,
} from "../hooks/useFormValidation";
import { Passenger } from "@shared/api";

interface PassengersProps {
  onNext: () => void;
  onBack: () => void;
  currentStep: string;
  onNavigate: (step: any) => void;
}

export default function Passengers({
  onNext,
  onBack,
  currentStep,
  onNavigate,
}: PassengersProps) {
  const navigate = useNavigate();
  const [contactEmail, setContactEmail] = useState("");
  const [passengers, setPassengers] = useState<Passenger[]>([
    { title: "Mr", firstName: "", lastName: "", email: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);

  // Load route data from previous step and restore passenger data
  useEffect(() => {
    // Load route data
    const savedRoute =
      localStorage.getItem("selectedRoute") ||
      localStorage.getItem("bookingRoute");
    if (savedRoute) {
      try {
        setRouteData(JSON.parse(savedRoute));
      } catch (error) {
        console.error("Error parsing route data:", error);
      }
    }

    // Restore passenger data
    const savedPassengers = localStorage.getItem("bookingPassengers");
    const savedContactEmail = localStorage.getItem("bookingContactEmail");

    if (savedPassengers) {
      try {
        const passengerData = JSON.parse(savedPassengers);
        if (Array.isArray(passengerData) && passengerData.length > 0) {
          setPassengers(passengerData);
        }
      } catch (error) {
        console.error("Error parsing passenger data:", error);
      }
    }

    if (savedContactEmail) {
      setContactEmail(savedContactEmail);
    }
  }, []);

  // Save passenger data whenever it changes
  useEffect(() => {
    if (passengers.length > 0 && passengers[0].firstName) {
      localStorage.setItem("bookingPassengers", JSON.stringify(passengers));
    }
  }, [passengers]);

  // Save contact email whenever it changes
  useEffect(() => {
    if (contactEmail) {
      localStorage.setItem("bookingContactEmail", contactEmail);
    }
  }, [contactEmail]);

  // Form validation rules
  const getValidationRules = () => {
    const rules: any = {
      contactEmail: CommonValidationRules.email,
    };

    passengers.forEach((_, index) => {
      rules[`passenger_${index}_firstName`] = CommonValidationRules.firstName;
      rules[`passenger_${index}_lastName`] = CommonValidationRules.lastName;
      rules[`passenger_${index}_title`] = CommonValidationRules.title;
    });

    return rules;
  };

  const {
    validateForm,
    validateSingleField,
    setFieldTouched,
    getFieldError,
    hasFieldError,
    clearFieldError,
  } = useFormValidation(getValidationRules());

  const addPassenger = () => {
    if (passengers.length < 9) {
      // Limit to 9 passengers
      setPassengers([
        ...passengers,
        { title: "Mr", firstName: "", lastName: "", email: "" },
      ]);
    }
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      const newPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(newPassengers);
    }
  };

  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: string,
  ) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);

    // Clear validation error for this field
    const fieldKey = `passenger_${index}_${field}`;
    clearFieldError(fieldKey);
    setFieldTouched(fieldKey, true);

    // Validate field
    setTimeout(() => {
      validateSingleField(fieldKey, value);
    }, 100);
  };

  const handleContactEmailChange = (value: string) => {
    setContactEmail(value);
    clearFieldError("contactEmail");
    setFieldTouched("contactEmail", true);

    setTimeout(() => {
      validateSingleField("contactEmail", value);
    }, 100);
  };

  const handleNext = async () => {
    // Create form data for validation
    const formData: any = { contactEmail };
    passengers.forEach((passenger, index) => {
      formData[`passenger_${index}_firstName`] = passenger.firstName;
      formData[`passenger_${index}_lastName`] = passenger.lastName;
      formData[`passenger_${index}_title`] = passenger.title;
    });

    // Set all fields as touched
    setFieldTouched("contactEmail", true);
    passengers.forEach((_, index) => {
      setFieldTouched(`passenger_${index}_firstName`, true);
      setFieldTouched(`passenger_${index}_lastName`, true);
      setFieldTouched(`passenger_${index}_title`, true);
    });

    const isValid = validateForm(formData);

    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      // Prepare clean passenger data
      const cleanPassengers = passengers.map((p) => ({
        title: p.title,
        firstName: p.firstName.trim(),
        lastName: p.lastName.trim(),
        email: p.email?.trim() || contactEmail.trim(),
      }));

      // Save passenger data to multiple keys for compatibility
      const passengerData = {
        contactEmail: contactEmail.trim(),
        passengers: cleanPassengers,
      };

      localStorage.setItem("passengerData", JSON.stringify(passengerData));
      localStorage.setItem(
        "bookingPassengers",
        JSON.stringify(cleanPassengers),
      );
      localStorage.setItem("bookingContactEmail", contactEmail.trim());

      console.log("Passenger data saved:", passengerData);

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 800));

      onNext();
    } catch (error) {
      console.error("Error saving passenger data:", error);
      // Still allow progression for demo purposes
      onNext();
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
              onClick={() => navigate("/userform/route")}
              className="text-2xl font-bold text-white/60 hover:text-white transition-colors"
            >
              Route
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-2xl font-bold">Passengers</button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/userform/confirmation")}
              className="text-2xl font-bold text-white/60 hover:text-white transition-colors"
            >
              Confirmation
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex items-center">
            <div className="h-1 bg-ticket-secondary flex-1"></div>
            <div className="h-1 bg-ticket-accent w-56"></div>
            <div className="h-1 bg-ticket-secondary flex-1"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Left Side - Form */}
          <div className="space-y-8">
            {/* Passenger Section */}
            <div>
              <h2 className="text-2xl font-bold mb-8 text-[#F6F6FF]">
                Passenger
              </h2>

              {/* Contact Email */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-[#F6F6FF] mb-2">
                  Contact Email *
                </label>
                <div className="relative">
                  <div className="bg-ticket-secondary rounded-lg p-4 relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 opacity-60" />
                    <input
                      type="email"
                      placeholder="Enter contact email"
                      value={contactEmail}
                      onChange={(e) => handleContactEmailChange(e.target.value)}
                      onBlur={() => setFieldTouched("contactEmail", true)}
                      className={`w-full bg-transparent pl-12 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none ${
                        hasFieldError("contactEmail")
                          ? "border border-red-500 rounded"
                          : ""
                      }`}
                    />
                  </div>
                  {hasFieldError("contactEmail") && (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError("contactEmail")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Passengers */}
              <div className="space-y-6">
                {passengers.map((passenger, index) => (
                  <div
                    key={index}
                    className="bg-ticket-light/20 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[#F6F6FF]">
                        Passenger {index + 1}
                      </h3>
                      {passengers.length > 1 && (
                        <button
                          onClick={() => removePassenger(index)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Title Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-[#F6F6FF] mb-2">
                        Title *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Mr", "Ms", "Mrs"].map((title) => (
                          <button
                            key={title}
                            onClick={() =>
                              updatePassenger(index, "title", title)
                            }
                            className={`h-12 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center ${
                              passenger.title === title
                                ? "bg-ticket-dark text-white"
                                : "bg-ticket-light text-white/55"
                            }`}
                          >
                            {title}
                          </button>
                        ))}
                      </div>
                      {hasFieldError(`passenger_${index}_title`) && (
                        <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>
                            {getFieldError(`passenger_${index}_title`)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#F6F6FF] mb-2">
                          First Name *
                        </label>
                        <div className="bg-ticket-secondary rounded-lg p-4">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={passenger.firstName}
                            onChange={(e) =>
                              updatePassenger(
                                index,
                                "firstName",
                                e.target.value,
                              )
                            }
                            onBlur={() =>
                              setFieldTouched(
                                `passenger_${index}_firstName`,
                                true,
                              )
                            }
                            className={`w-full bg-transparent text-white placeholder-gray-400 focus:outline-none ${
                              hasFieldError(`passenger_${index}_firstName`)
                                ? "border border-red-500 rounded"
                                : ""
                            }`}
                          />
                        </div>
                        {hasFieldError(`passenger_${index}_firstName`) && (
                          <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                              {getFieldError(`passenger_${index}_firstName`)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#F6F6FF] mb-2">
                          Last Name *
                        </label>
                        <div className="bg-ticket-secondary rounded-lg p-4">
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={passenger.lastName}
                            onChange={(e) =>
                              updatePassenger(index, "lastName", e.target.value)
                            }
                            onBlur={() =>
                              setFieldTouched(
                                `passenger_${index}_lastName`,
                                true,
                              )
                            }
                            className={`w-full bg-transparent text-white placeholder-gray-400 focus:outline-none ${
                              hasFieldError(`passenger_${index}_lastName`)
                                ? "border border-red-500 rounded"
                                : ""
                            }`}
                          />
                        </div>
                        {hasFieldError(`passenger_${index}_lastName`) && (
                          <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                              {getFieldError(`passenger_${index}_lastName`)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Passenger Button */}
                {passengers.length < 9 && (
                  <button
                    onClick={addPassenger}
                    className="w-full bg-ticket-secondary rounded-lg p-4 flex items-center justify-center gap-2 hover:bg-opacity-80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-semibold text-white/55">
                      Add Another Passenger ({passengers.length}/9)
                    </span>
                  </button>
                )}
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
                    <div className="text-3xl font-bold text-black">(RFD)</div>
                    <div className="text-xs font-semibold text-ticket-gray">
                      Chicago Rockford
                    </div>
                    <div className="text-xs text-ticket-gray-light">
                      20/05/205
                    </div>
                  </div>
                  <ArrowRight className="w-8 h-8 text-black" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-black">(ORY)</div>
                    <div className="text-xs font-semibold text-ticket-gray">
                      Paris Orly
                    </div>
                    <div className="text-xs text-ticket-gray-light">
                      30/05/205
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger Info */}
              <div className="mb-6">
                <div className="text-sm font-semibold text-ticket-text mb-1">
                  Passenger{passengers.length > 1 ? "s" : ""} /{" "}
                  {passengers.length}
                </div>
                {passengers.slice(0, 2).map((passenger, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-ticket-text font-semibold">
                          Passenger {index + 1}
                        </div>
                        <div className="font-bold">
                          {passenger.title || "Mr"}.
                          {passenger.firstName || "First"}{" "}
                          {passenger.lastName || "Last"}
                        </div>
                      </div>
                      <div>
                        <div className="text-ticket-text font-semibold">
                          Flight
                        </div>
                        <div className="font-bold">$10 USD</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>
                        <div className="text-ticket-text font-semibold">
                          Seat
                        </div>
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
                ))}
                {passengers.length > 2 && (
                  <div className="text-xs text-ticket-gray-light mt-2">
                    + {passengers.length - 2} more passenger
                    {passengers.length - 2 > 1 ? "s" : ""}
                  </div>
                )}
              </div>

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
