import Amadeus from "amadeus";

// Initialize Amadeus client only if credentials are available
let amadeus: Amadeus | null = null;

if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
  amadeus = new Amadeus({
    clientId: process.env.AMADEUS_API_KEY,
    clientSecret: process.env.AMADEUS_API_SECRET,
    hostname: process.env.NODE_ENV === "production" ? "production" : "test", // 'test' for sandbox, 'production' for live
  });
}

export interface FlightSearchParams {
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

export interface AirportSearchParams {
  keyword: string;
  subType?: "AIRPORT" | "CITY";
}

export interface Airport {
  type: string;
  subType: string;
  name: string;
  detailedName: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
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

export interface FlightPriceParams {
  flightOffers: any[];
}

export interface SeatMapParams {
  flightOfferId: string;
}

export class AmadeusService {
  /**
   * Check if Amadeus is available
   */
  private static isAmadeusAvailable(): boolean {
    return amadeus !== null;
  }

  /**
   * Search for flight offers
   */
  static async searchFlightOffers(
    params: FlightSearchParams,
  ): Promise<FlightOffer[]> {
    try {
      console.log("Searching flights with Amadeus:", params);

      // Check if Amadeus is configured, otherwise use mock data
      if (!this.isAmadeusAvailable()) {
        console.log("Amadeus not configured, returning mock flight data");
        return this.getMockFlightOffers(params);
      }

      const searchParams = {
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        adults: params.adults,
        max: params.max || 10,
        ...(params.returnDate && { returnDate: params.returnDate }),
        ...(params.children && { children: params.children }),
        ...(params.infants && { infants: params.infants }),
        ...(params.travelClass && { travelClass: params.travelClass }),
        ...(params.currencyCode && { currencyCode: params.currencyCode }),
      };

      const response =
        await amadeus!.shopping.flightOffersSearch.get(searchParams);

      if (response.data && response.data.length > 0) {
        console.log(`Found ${response.data.length} flight offers`);
        return response.data;
      } else {
        console.log("No flight offers found");
        return [];
      }
    } catch (error) {
      console.error("Amadeus flight search error:", error);

      // Always return mock data when Amadeus fails
      console.log("Amadeus API failed, returning mock flight data");
      return this.getMockFlightOffers(params);
    }
  }

  /**
   * Search for airports and cities
   */
  static async searchAirports(params: AirportSearchParams): Promise<Airport[]> {
    try {
      console.log("Searching airports with Amadeus:", params);

      // Check if Amadeus is configured, otherwise use mock data
      if (!this.isAmadeusAvailable()) {
        console.log("Amadeus not configured, returning mock airport data");
        return this.getMockAirports(params.keyword);
      }

      const response = await amadeus!.referenceData.locations.get({
        keyword: params.keyword,
        subType: params.subType || "AIRPORT,CITY",
        "page[limit]": 10,
      });

      if (response.data && response.data.length > 0) {
        console.log(`Found ${response.data.length} airports/cities`);
        return response.data;
      } else {
        console.log("No airports/cities found");
        return [];
      }
    } catch (error) {
      console.error("Amadeus airport search error:", error);

      // Always return mock data when Amadeus fails
      console.log("Amadeus API failed, returning mock airport data");
      return this.getMockAirports(params.keyword);
    }
  }

  /**
   * Get flight price details
   */
  static async getFlightPrice(params: FlightPriceParams): Promise<any> {
    if (!this.isAmadeusAvailable()) {
      throw new Error(
        "Amadeus is not configured. Flight pricing requires valid API credentials.",
      );
    }

    try {
      console.log("Getting flight price with Amadeus");

      const response = await amadeus!.shopping.flightOffers.pricing.post(
        JSON.stringify({
          data: {
            type: "flight-offers-pricing",
            flightOffers: params.flightOffers,
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error("Amadeus flight pricing error:", error);
      throw error;
    }
  }

  /**
   * Get seat maps for a flight
   */
  static async getSeatMaps(params: SeatMapParams): Promise<any> {
    if (!this.isAmadeusAvailable()) {
      throw new Error(
        "Amadeus is not configured. Seat maps require valid API credentials.",
      );
    }

    try {
      console.log("Getting seat maps with Amadeus");

      const response = await amadeus!.shopping.seatMaps.get({
        "flight-offerId": params.flightOfferId,
      });

      return response.data;
    } catch (error) {
      console.error("Amadeus seat map error:", error);
      throw error;
    }
  }

  /**
   * Get airline information
   */
  static async getAirline(airlineCode: string): Promise<any> {
    if (!this.isAmadeusAvailable()) {
      throw new Error(
        "Amadeus is not configured. Airline information requires valid API credentials.",
      );
    }

    try {
      const response = await amadeus!.referenceData.airlines.get({
        airlineCodes: airlineCode,
      });

      return response.data;
    } catch (error) {
      console.error("Amadeus airline info error:", error);
      throw error;
    }
  }

  /**
   * Mock flight offers for development/demo
   */
  private static getMockFlightOffers(
    params: FlightSearchParams,
  ): FlightOffer[] {
    const basePrice = Math.floor(Math.random() * 500) + 100;
    const departureTime = new Date(params.departureDate);
    departureTime.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
    );

    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(
      arrivalTime.getHours() + 2 + Math.floor(Math.random() * 8),
    );

    return [
      {
        id: "1",
        source: "GDS",
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: !params.returnDate,
        lastTicketingDate: "2024-12-31",
        numberOfBookableSeats: Math.floor(Math.random() * 9) + 1,
        itineraries: [
          {
            duration: "PT4H30M",
            segments: [
              {
                departure: {
                  iataCode: params.originLocationCode,
                  at: departureTime.toISOString(),
                },
                arrival: {
                  iataCode: params.destinationLocationCode,
                  at: arrivalTime.toISOString(),
                },
                carrierCode: "AA",
                number: "1234",
                aircraft: {
                  code: "737",
                },
                duration: "PT4H30M",
                id: "1",
                numberOfStops: 0,
                blacklistedInEU: false,
              },
            ],
          },
        ],
        price: {
          currency: params.currencyCode || "USD",
          total: (basePrice * params.adults).toString(),
          base: (basePrice * params.adults * 0.85).toString(),
          fees: [
            {
              amount: (basePrice * params.adults * 0.15).toString(),
              type: "SUPPLIER",
            },
          ],
          grandTotal: (basePrice * params.adults).toString(),
        },
        pricingOptions: {
          fareType: ["PUBLISHED"],
          includedCheckedBagsOnly: true,
        },
        validatingAirlineCodes: ["AA"],
        travelerPricings: Array.from({ length: params.adults }, (_, i) => ({
          travelerId: (i + 1).toString(),
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: params.currencyCode || "USD",
            total: basePrice.toString(),
            base: (basePrice * 0.85).toString(),
            fees: [
              {
                amount: (basePrice * 0.15).toString(),
                type: "SUPPLIER",
              },
            ],
            grandTotal: basePrice.toString(),
          },
          fareDetailsBySegment: [
            {
              segmentId: "1",
              cabin: params.travelClass || "ECONOMY",
              fareBasis: "Y",
              class: "Y",
              includedCheckedBags: {
                quantity: 1,
              },
            },
          ],
        })),
      },
      // Add more mock flights
      {
        id: "2",
        source: "GDS",
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: !params.returnDate,
        lastTicketingDate: "2024-12-31",
        numberOfBookableSeats: Math.floor(Math.random() * 9) + 1,
        itineraries: [
          {
            duration: "PT5H15M",
            segments: [
              {
                departure: {
                  iataCode: params.originLocationCode,
                  at: new Date(departureTime.getTime() + 3600000).toISOString(), // 1 hour later
                },
                arrival: {
                  iataCode: params.destinationLocationCode,
                  at: new Date(arrivalTime.getTime() + 4500000).toISOString(), // 1.25 hours later
                },
                carrierCode: "DL",
                number: "5678",
                aircraft: {
                  code: "A320",
                },
                duration: "PT5H15M",
                id: "2",
                numberOfStops: 0,
                blacklistedInEU: false,
              },
            ],
          },
        ],
        price: {
          currency: params.currencyCode || "USD",
          total: ((basePrice + 50) * params.adults).toString(),
          base: ((basePrice + 50) * params.adults * 0.85).toString(),
          fees: [
            {
              amount: ((basePrice + 50) * params.adults * 0.15).toString(),
              type: "SUPPLIER",
            },
          ],
          grandTotal: ((basePrice + 50) * params.adults).toString(),
        },
        pricingOptions: {
          fareType: ["PUBLISHED"],
          includedCheckedBagsOnly: true,
        },
        validatingAirlineCodes: ["DL"],
        travelerPricings: Array.from({ length: params.adults }, (_, i) => ({
          travelerId: (i + 1).toString(),
          fareOption: "STANDARD",
          travelerType: "ADULT",
          price: {
            currency: params.currencyCode || "USD",
            total: (basePrice + 50).toString(),
            base: ((basePrice + 50) * 0.85).toString(),
            fees: [
              {
                amount: ((basePrice + 50) * 0.15).toString(),
                type: "SUPPLIER",
              },
            ],
            grandTotal: (basePrice + 50).toString(),
          },
          fareDetailsBySegment: [
            {
              segmentId: "2",
              cabin: params.travelClass || "ECONOMY",
              fareBasis: "Y",
              class: "Y",
              includedCheckedBags: {
                quantity: 1,
              },
            },
          ],
        })),
      },
    ];
  }

  /**
   * Comprehensive airport data for development/demo and when Amadeus fails
   */
  private static getMockAirports(keyword: string): Airport[] {
    // Import comprehensive airport data
    const { searchAirports } = require("./airportData.js");

    const airportResults = searchAirports(keyword, 15);

    // Convert to Amadeus format
    return airportResults.map((airport) => ({
      type: "location",
      subType: "AIRPORT",
      name: airport.name,
      detailedName: `${airport.city.toUpperCase()}/${airport.country.toUpperCase()}:${airport.name.toUpperCase()}`,
      id: `A${airport.code}`,
      self: {
        href: `https://test.api.amadeus.com/v1/reference-data/locations/A${airport.code}`,
        methods: ["GET"],
      },
      timeZoneOffset: "+00:00", // Default timezone
      iataCode: airport.code,
      geoCode: {
        latitude: 0, // Default coordinates - in real app you'd have actual coordinates
        longitude: 0,
      },
      address: {
        cityName: airport.city.toUpperCase(),
        cityCode: airport.code,
        countryName: airport.country.toUpperCase(),
        countryCode: this.getCountryCode(airport.country),
        regionCode: this.getRegionCode(airport.region),
      },
      analytics: {
        travelers: {
          score: 25, // Default score
        },
      },
    }));
  }

  /**
   * Get country code from country name
   */
  private static getCountryCode(country: string): string {
    const countryCodes: { [key: string]: string } = {
      "United States": "US",
      Canada: "CA",
      Mexico: "MX",
      "United Kingdom": "GB",
      France: "FR",
      Germany: "DE",
      Netherlands: "NL",
      Spain: "ES",
      Italy: "IT",
      Switzerland: "CH",
      Austria: "AT",
      Denmark: "DK",
      Sweden: "SE",
      Norway: "NO",
      Finland: "FI",
      Turkey: "TR",
      Greece: "GR",
      Ireland: "IE",
      Belgium: "BE",
      Portugal: "PT",
      "Czech Republic": "CZ",
      Poland: "PL",
      Hungary: "HU",
      Japan: "JP",
      "South Korea": "KR",
      China: "CN",
      "Hong Kong": "HK",
      Taiwan: "TW",
      Singapore: "SG",
      Malaysia: "MY",
      Thailand: "TH",
      Indonesia: "ID",
      Philippines: "PH",
      India: "IN",
      "United Arab Emirates": "AE",
      Qatar: "QA",
      Kuwait: "KW",
      Bahrain: "BH",
      "Saudi Arabia": "SA",
      Israel: "IL",
      Egypt: "EG",
      "South Africa": "ZA",
      Morocco: "MA",
      Nigeria: "NG",
      Ethiopia: "ET",
      Australia: "AU",
      "New Zealand": "NZ",
      Brazil: "BR",
      Argentina: "AR",
      Chile: "CL",
      Peru: "PE",
      Colombia: "CO",
      Ecuador: "EC",
      Venezuela: "VE",
    };
    return countryCodes[country] || "XX";
  }

  /**
   * Get region code from region name
   */
  private static getRegionCode(region: string): string {
    const regionCodes: { [key: string]: string } = {
      "North America": "NAMER",
      Europe: "EUR",
      Asia: "ASIA",
      "Middle East": "MEAST",
      Africa: "AFR",
      Oceania: "OCEANIA",
      "South America": "SAMER",
    };
    return regionCodes[region] || "UNKNOWN";
  }
}

export default AmadeusService;
