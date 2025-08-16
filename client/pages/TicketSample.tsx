import React from "react";
import { ArrowLeft, Download, Plane, MapPin, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Reusable ticket component that can be used throughout the app
interface TicketProps {
  route?: {
    from: { code: string; city: string; name: string };
    to: { code: string; city: string; name: string };
    departureDate: string;
    departureTime?: string;
    returnDate?: string;
  };
  passengers?: Array<{
    title: string;
    firstName: string;
    lastName: string;
  }>;
  pnr?: string;
  price?: number;
  currency?: string;
  flightNumber?: string;
  showSample?: boolean;
}

export const TicketComponent: React.FC<TicketProps> = ({
  route = {
    from: { code: "JFK", city: "New York", name: "John F. Kennedy International Airport" },
    to: { code: "LHR", city: "London", name: "London Heathrow Airport" },
    departureDate: "2024-02-15",
    departureTime: "14:30",
  },
  passengers = [{ title: "Mr", firstName: "John", lastName: "Doe" }],
  pnr = "ABC123",
  price = 450,
  currency = "USD",
  flightNumber = "BA 178",
  showSample = false,
}) => {
  // Generate barcode visualization
  const generateBarcode = () => {
    const bars = [];
    for (let i = 0; i < 50; i++) {
      const height = Math.random() * 20 + 10;
      bars.push(
        <div
          key={i}
          className="bg-black"
          style={{
            width: "2px",
            height: `${height}px`,
            marginRight: "1px",
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-ticket-darker text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6" />
            <span className="font-bold text-lg">OnboardTicket</span>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-80">PNR</div>
            <div className="font-bold">{pnr}</div>
          </div>
        </div>
        {showSample && (
          <div className="mt-2 text-center">
            <span className="text-xs bg-white/20 px-2 py-1 rounded">SAMPLE TICKET</span>
          </div>
        )}
      </div>

      {/* Route Information */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{route.from.code}</div>
              <div className="text-sm text-gray-600">{route.from.city}</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-0.5 bg-gray-300 flex-1"></div>
              <Plane className="w-6 h-6 text-[#3839C9] mx-3 transform rotate-90" />
              <div className="h-0.5 bg-gray-300 flex-1"></div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{route.to.code}</div>
              <div className="text-sm text-gray-600">{route.to.city}</div>
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Flight</div>
            <div className="font-semibold">{flightNumber}</div>
          </div>
          <div>
            <div className="text-gray-500">Date</div>
            <div className="font-semibold">
              {new Date(route.departureDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Departure</div>
            <div className="font-semibold">{route.departureTime || "14:30"}</div>
          </div>
          <div>
            <div className="text-gray-500">Price</div>
            <div className="font-semibold">{price} {currency}</div>
          </div>
        </div>
      </div>

      {/* Passenger Information */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">PASSENGER DETAILS</h3>
        <div className="space-y-2">
          {passengers.map((passenger, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {passenger.title} {passenger.firstName} {passenger.lastName}
                </span>
              </div>
              <div className="text-xs text-gray-500">Seat {String.fromCharCode(65 + index)}{index + 12}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Barcode Section */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="text-center mb-3">
          <div className="text-xs text-gray-500 mb-2">BOARDING PASS</div>
          <div className="flex justify-center items-end gap-0.5">
            {generateBarcode()}
          </div>
          <div className="text-xs text-gray-400 mt-2 font-mono">{pnr}-{Date.now()}</div>
        </div>
      </div>
    </div>
  );
};

export default function TicketSample() {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/userform");
  };

  return (
    <div className="min-h-screen bg-[#E7E9FF] font-jakarta">
      <Header handleBookNow={handleBookNow} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#3839C9] hover:text-blue-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </button>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#3839C9] mb-4">
            Sample Ticket
          </h1>
          <p className="text-lg text-[#637996] mb-6 max-w-2xl mx-auto">
            This is how your ticket will look after you complete your booking. 
            Professional, secure, and ready for travel.
          </p>
        </div>

        {/* Ticket Display */}
        <div className="flex justify-center mb-12">
          <TicketComponent showSample={true} />
        </div>

        {/* Features Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 md:p-12 shadow-xl border border-[#E7E9FF] mb-8">
          <h2 className="text-2xl font-bold text-[#20242A] mb-8 text-center">
            Your Digital Ticket Includes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#3839C9] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-[#20242A] mb-2">Flight Details</h3>
              <p className="text-sm text-[#637996]">Complete route information with airport codes and cities</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#3839C9] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-[#20242A] mb-2">Passenger Info</h3>
              <p className="text-sm text-[#637996]">All passenger details and seat assignments</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#3839C9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-[#20242A] mb-2">Time & Date</h3>
              <p className="text-sm text-[#637996]">Departure times and travel dates clearly displayed</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#3839C9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-[#20242A] mb-2">Downloadable</h3>
              <p className="text-sm text-[#637996]">Save as PDF or print for easy travel</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[#20242A] mb-4">
            Ready to Book Your Flight?
          </h3>
          <p className="text-[#637996] mb-8 max-w-xl mx-auto">
            Start your booking journey now and get your professional ticket in minutes.
          </p>
          <button
            onClick={handleBookNow}
            className="bg-[#3839C9] text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            Book Your Flight Now
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
