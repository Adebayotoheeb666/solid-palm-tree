import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlightOffer, FlightSegment } from "@shared/api";
import { Plane, Clock, DollarSign, Loader2, AlertCircle, Zap, Wifi, Coffee } from "lucide-react";

interface SearchFlightsProps {
  onNext: () => void;
}

export default function SearchFlights({ onNext }: SearchFlightsProps) {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);

  useEffect(() => {
    searchFlights();
  }, []);

  const searchFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get saved route data from localStorage
      const routeData = localStorage.getItem('bookingRoute');
      if (!routeData) {
        setError('No route data found. Please go back and select your route.');
        return;
      }

      const route = JSON.parse(routeData);
      
      // Search for flights using Amadeus API
      const params = new URLSearchParams({
        originLocationCode: route.from.code,
        destinationLocationCode: route.to.code,
        departureDate: route.departureDate,
        adults: '1', // For now, assuming 1 adult - can be made dynamic
        currencyCode: 'USD',
        max: '10'
      });

      if (route.returnDate && route.tripType === 'roundtrip') {
        params.append('returnDate', route.returnDate);
      }

      console.log('Searching flights with params:', params.toString());

      const response = await fetch(`/api/amadeus/flights/search?${params}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setFlights(data.data);
      } else {
        // If no flights found or API failed, show a helpful message
        setError('No flights found for this route. Please try different dates or destinations.');
      }
    } catch (err) {
      console.error('Flight search error:', err);
      setError('Unable to search flights at the moment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const selectFlight = (flight: FlightOffer) => {
    setSelectedFlight(flight);
    // Save selected flight to localStorage
    localStorage.setItem('selectedFlight', JSON.stringify(flight));
  };

  const confirmSelection = () => {
    if (selectedFlight) {
      onNext();
    }
  };

  const formatDuration = (duration: string) => {
    // Convert PT4H30M to "4h 30m"
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return duration;
    
    const hours = match[1] ? `${match[1]}h` : '';
    const minutes = match[2] ? `${match[2]}m` : '';
    return `${hours} ${minutes}`.trim();
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderFlightSegment = (segment: FlightSegment, index: number) => (
    <div key={segment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-xl font-bold">{formatTime(segment.departure.at)}</div>
          <div className="text-sm text-white/60">{segment.departure.iataCode}</div>
          <div className="text-xs text-white/40">{formatDate(segment.departure.at)}</div>
        </div>
        
        <div className="flex flex-col items-center gap-2 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">
          <div className="text-xs text-white/60">{formatDuration(segment.duration)}</div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="flex-1 h-px bg-white/30"></div>
            <Plane className="w-4 h-4 text-white/60" />
            <div className="flex-1 h-px bg-white/30"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="text-xs text-white/60">
            {segment.numberOfStops === 0 ? 'Direct' : `${segment.numberOfStops} stop${segment.numberOfStops > 1 ? 's' : ''}`}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold">{formatTime(segment.arrival.at)}</div>
          <div className="text-sm text-white/60">{segment.arrival.iataCode}</div>
          <div className="text-xs text-white/40">{formatDate(segment.arrival.at)}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-sm text-white/60">Flight {segment.carrierCode}{segment.number}</div>
        <div className="text-xs text-white/40">{segment.aircraft.code}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-ticket-primary text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Searching for flights...</h2>
          <p className="text-white/60">Finding the best options for your journey</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ticket-primary text-white">
        <header className="p-4">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}> 
            <img 
              src="/onboard/result.png" 
              alt="OnboardTicket Logo" 
              className="h-[40px] sm:h-[59px] w-auto max-w-[200px] sm:max-w-[294px] cursor-pointer"
            />
          </div>
        </header>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Unable to Find Flights</h2>
          <p className="text-white/60 text-center mb-8 max-w-md">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/search-flights')}
              className="bg-white text-ticket-primary font-bold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
            >
              Try Different Route
            </button>
            <button
              onClick={() => searchFlights()}
              className="bg-ticket-accent text-black font-bold px-6 py-3 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Search Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ticket-primary text-white">
      {/* Header */}
      <header className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}> 
            <img 
              src="/onboard/result.png" 
              alt="OnboardTicket Logo" 
              className="h-[40px] sm:h-[59px] w-auto max-w-[200px] sm:max-w-[294px] cursor-pointer"
            />
          </div>
          <button
            onClick={() => navigate('/userform/route')}
            className="text-white/60 hover:text-white transition-colors"
          >
            Modify Search
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Available Flights</h1>
          <div className="flex items-center gap-4 text-white/60">
            <span>Found {flights.length} flight{flights.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Best prices guaranteed</span>
          </div>
        </div>

        {/* Flight Results */}
        <div className="space-y-6">
          {flights.map((flight, index) => (
            <div
              key={flight.id}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 cursor-pointer transition-all hover:bg-white/15 ${
                selectedFlight?.id === flight.id ? 'ring-2 ring-ticket-accent bg-white/20' : ''
              }`}
              onClick={() => selectFlight(flight)}
            >
              {/* Flight Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-ticket-accent text-black px-2 py-1 rounded text-sm font-semibold">
                      {flight.validatingAirlineCodes[0]}
                    </span>
                    {flight.numberOfBookableSeats <= 3 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                        Only {flight.numberOfBookableSeats} seats left
                      </span>
                    )}
                  </div>
                  <div className="text-white/60 text-sm">
                    {flight.oneWay ? 'One way' : 'Round trip'} • {flight.travelerPricings.length} passenger{flight.travelerPricings.length > 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-ticket-accent">
                    {flight.price.currency} {parseInt(flight.price.total).toLocaleString()}
                  </div>
                  <div className="text-white/60 text-sm">per person</div>
                </div>
              </div>

              {/* Flight Segments */}
              <div className="space-y-4">
                {flight.itineraries.map((itinerary, itinIndex) => (
                  <div key={itinIndex}>
                    {itinIndex > 0 && (
                      <div className="text-center text-white/60 text-sm py-2">
                        Return Flight
                      </div>
                    )}
                    <div className="space-y-3">
                      {itinerary.segments.map((segment, segIndex) => 
                        renderFlightSegment(segment, segIndex)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Flight Features */}
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/60">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">WiFi Available</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Coffee className="w-4 h-4" />
                  <span className="text-sm">Meals Included</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Power Outlets</span>
                </div>
                {selectedFlight?.id === flight.id && (
                  <div className="ml-auto">
                    <span className="bg-ticket-accent text-black px-3 py-1 rounded-full text-sm font-semibold">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        {selectedFlight && (
          <div className="fixed bottom-4 inset-x-4 z-10 flex justify-center">
            <button
              onClick={confirmSelection}
              className="bg-ticket-accent text-black font-bold text-base sm:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-full hover:bg-opacity-80 transition-colors shadow-lg w-full max-w-xs sm:max-w-sm"
            >
              Continue with Selected Flight
            </button>
          </div>
        )}

        {/* No Selection Message */}
        {flights.length > 0 && !selectedFlight && (
          <div className="text-center mt-8">
            <p className="text-white/60">Select a flight to continue</p>
          </div>
        )}
      </div>
    </div>
  );
}
