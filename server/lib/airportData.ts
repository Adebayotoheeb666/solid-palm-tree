// Comprehensive list of major international airports
export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
  region: string;
}

export const MAJOR_AIRPORTS: AirportInfo[] = [
  // North America
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    region: "North America",
  },
  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
    region: "North America",
  },
  {
    code: "ORD",
    name: "O'Hare International Airport",
    city: "Chicago",
    country: "United States",
    region: "North America",
  },
  {
    code: "DFW",
    name: "Dallas/Fort Worth International Airport",
    city: "Dallas",
    country: "United States",
    region: "North America",
  },
  {
    code: "DEN",
    name: "Denver International Airport",
    city: "Denver",
    country: "United States",
    region: "North America",
  },
  {
    code: "LAS",
    name: "Harry Reid International Airport",
    city: "Las Vegas",
    country: "United States",
    region: "North America",
  },
  {
    code: "PHX",
    name: "Phoenix Sky Harbor International Airport",
    city: "Phoenix",
    country: "United States",
    region: "North America",
  },
  {
    code: "IAH",
    name: "George Bush Intercontinental Airport",
    city: "Houston",
    country: "United States",
    region: "North America",
  },
  {
    code: "MIA",
    name: "Miami International Airport",
    city: "Miami",
    country: "United States",
    region: "North America",
  },
  {
    code: "SEA",
    name: "Seattle-Tacoma International Airport",
    city: "Seattle",
    country: "United States",
    region: "North America",
  },
  {
    code: "SFO",
    name: "San Francisco International Airport",
    city: "San Francisco",
    country: "United States",
    region: "North America",
  },
  {
    code: "LGA",
    name: "LaGuardia Airport",
    city: "New York",
    country: "United States",
    region: "North America",
  },
  {
    code: "EWR",
    name: "Newark Liberty International Airport",
    city: "Newark",
    country: "United States",
    region: "North America",
  },
  {
    code: "BOS",
    name: "Logan International Airport",
    city: "Boston",
    country: "United States",
    region: "North America",
  },
  {
    code: "BWI",
    name: "Baltimore/Washington International Airport",
    city: "Baltimore",
    country: "United States",
    region: "North America",
  },
  {
    code: "DCA",
    name: "Ronald Reagan Washington National Airport",
    city: "Washington D.C.",
    country: "United States",
    region: "North America",
  },
  {
    code: "IAD",
    name: "Washington Dulles International Airport",
    city: "Washington D.C.",
    country: "United States",
    region: "North America",
  },
  {
    code: "ATL",
    name: "Hartsfield-Jackson Atlanta International Airport",
    city: "Atlanta",
    country: "United States",
    region: "North America",
  },
  {
    code: "CLT",
    name: "Charlotte Douglas International Airport",
    city: "Charlotte",
    country: "United States",
    region: "North America",
  },
  {
    code: "MCO",
    name: "Orlando International Airport",
    city: "Orlando",
    country: "United States",
    region: "North America",
  },
  {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
    city: "Toronto",
    country: "Canada",
    region: "North America",
  },
  {
    code: "YVR",
    name: "Vancouver International Airport",
    city: "Vancouver",
    country: "Canada",
    region: "North America",
  },
  {
    code: "YUL",
    name: "Montréal-Pierre Elliott Trudeau International Airport",
    city: "Montreal",
    country: "Canada",
    region: "North America",
  },
  {
    code: "MEX",
    name: "Mexico City International Airport",
    city: "Mexico City",
    country: "Mexico",
    region: "North America",
  },

  // Europe
  {
    code: "LHR",
    name: "Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
  },
  {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    region: "Europe",
  },
  {
    code: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
    region: "Europe",
  },
  {
    code: "AMS",
    name: "Amsterdam Airport Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
  },
  {
    code: "MAD",
    name: "Adolfo Suárez Madrid-Barajas Airport",
    city: "Madrid",
    country: "Spain",
    region: "Europe",
  },
  {
    code: "BCN",
    name: "Barcelona-El Prat Airport",
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
  },
  {
    code: "FCO",
    name: "Leonardo da Vinci-Fiumicino Airport",
    city: "Rome",
    country: "Italy",
    region: "Europe",
  },
  {
    code: "MXP",
    name: "Milan Malpensa Airport",
    city: "Milan",
    country: "Italy",
    region: "Europe",
  },
  {
    code: "MUC",
    name: "Munich Airport",
    city: "Munich",
    country: "Germany",
    region: "Europe",
  },
  {
    code: "ZUR",
    name: "Zurich Airport",
    city: "Zurich",
    country: "Switzerland",
    region: "Europe",
  },
  {
    code: "VIE",
    name: "Vienna International Airport",
    city: "Vienna",
    country: "Austria",
    region: "Europe",
  },
  {
    code: "CPH",
    name: "Copenhagen Airport",
    city: "Copenhagen",
    country: "Denmark",
    region: "Europe",
  },
  {
    code: "ARN",
    name: "Stockholm Arlanda Airport",
    city: "Stockholm",
    country: "Sweden",
    region: "Europe",
  },
  {
    code: "OSL",
    name: "Oslo Airport",
    city: "Oslo",
    country: "Norway",
    region: "Europe",
  },
  {
    code: "HEL",
    name: "Helsinki-Vantaa Airport",
    city: "Helsinki",
    country: "Finland",
    region: "Europe",
  },
  {
    code: "IST",
    name: "Istanbul Airport",
    city: "Istanbul",
    country: "Turkey",
    region: "Europe",
  },
  {
    code: "ATH",
    name: "Athens International Airport",
    city: "Athens",
    country: "Greece",
    region: "Europe",
  },
  {
    code: "LGW",
    name: "Gatwick Airport",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
  },
  {
    code: "STN",
    name: "Stansted Airport",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
  },
  {
    code: "MAN",
    name: "Manchester Airport",
    city: "Manchester",
    country: "United Kingdom",
    region: "Europe",
  },
  {
    code: "EDI",
    name: "Edinburgh Airport",
    city: "Edinburgh",
    country: "United Kingdom",
    region: "Europe",
  },
  {
    code: "DUB",
    name: "Dublin Airport",
    city: "Dublin",
    country: "Ireland",
    region: "Europe",
  },
  {
    code: "BRU",
    name: "Brussels Airport",
    city: "Brussels",
    country: "Belgium",
    region: "Europe",
  },
  {
    code: "LIS",
    name: "Lisbon Airport",
    city: "Lisbon",
    country: "Portugal",
    region: "Europe",
  },
  {
    code: "OPO",
    name: "Francisco Sá Carneiro Airport",
    city: "Porto",
    country: "Portugal",
    region: "Europe",
  },
  {
    code: "PRG",
    name: "Václav Havel Airport Prague",
    city: "Prague",
    country: "Czech Republic",
    region: "Europe",
  },
  {
    code: "WAW",
    name: "Warsaw Chopin Airport",
    city: "Warsaw",
    country: "Poland",
    region: "Europe",
  },
  {
    code: "BUD",
    name: "Budapest Ferenc Liszt International Airport",
    city: "Budapest",
    country: "Hungary",
    region: "Europe",
  },

  // Asia
  {
    code: "NRT",
    name: "Narita International Airport",
    city: "Tokyo",
    country: "Japan",
    region: "Asia",
  },
  {
    code: "HND",
    name: "Haneda Airport",
    city: "Tokyo",
    country: "Japan",
    region: "Asia",
  },
  {
    code: "KIX",
    name: "Kansai International Airport",
    city: "Osaka",
    country: "Japan",
    region: "Asia",
  },
  {
    code: "ICN",
    name: "Incheon International Airport",
    city: "Seoul",
    country: "South Korea",
    region: "Asia",
  },
  {
    code: "PEK",
    name: "Beijing Capital International Airport",
    city: "Beijing",
    country: "China",
    region: "Asia",
  },
  {
    code: "PKX",
    name: "Beijing Daxing International Airport",
    city: "Beijing",
    country: "China",
    region: "Asia",
  },
  {
    code: "PVG",
    name: "Shanghai Pudong International Airport",
    city: "Shanghai",
    country: "China",
    region: "Asia",
  },
  {
    code: "SHA",
    name: "Shanghai Hongqiao International Airport",
    city: "Shanghai",
    country: "China",
    region: "Asia",
  },
  {
    code: "CAN",
    name: "Guangzhou Baiyun International Airport",
    city: "Guangzhou",
    country: "China",
    region: "Asia",
  },
  {
    code: "SZX",
    name: "Shenzhen Bao'an International Airport",
    city: "Shenzhen",
    country: "China",
    region: "Asia",
  },
  {
    code: "HKG",
    name: "Hong Kong International Airport",
    city: "Hong Kong",
    country: "Hong Kong",
    region: "Asia",
  },
  {
    code: "TPE",
    name: "Taiwan Taoyuan International Airport",
    city: "Taipei",
    country: "Taiwan",
    region: "Asia",
  },
  {
    code: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    region: "Asia",
  },
  {
    code: "KUL",
    name: "Kuala Lumpur International Airport",
    city: "Kuala Lumpur",
    country: "Malaysia",
    region: "Asia",
  },
  {
    code: "BKK",
    name: "Suvarnabhumi Airport",
    city: "Bangkok",
    country: "Thailand",
    region: "Asia",
  },
  {
    code: "DMK",
    name: "Don Mueang International Airport",
    city: "Bangkok",
    country: "Thailand",
    region: "Asia",
  },
  {
    code: "CGK",
    name: "Soekarno-Hatta International Airport",
    city: "Jakarta",
    country: "Indonesia",
    region: "Asia",
  },
  {
    code: "MNL",
    name: "Ninoy Aquino International Airport",
    city: "Manila",
    country: "Philippines",
    region: "Asia",
  },
  {
    code: "DEL",
    name: "Indira Gandhi International Airport",
    city: "New Delhi",
    country: "India",
    region: "Asia",
  },
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    country: "India",
    region: "Asia",
  },
  {
    code: "BLR",
    name: "Kempegowda International Airport",
    city: "Bangalore",
    country: "India",
    region: "Asia",
  },
  {
    code: "MAA",
    name: "Chennai International Airport",
    city: "Chennai",
    country: "India",
    region: "Asia",
  },
  {
    code: "HYD",
    name: "Rajiv Gandhi International Airport",
    city: "Hyderabad",
    country: "India",
    region: "Asia",
  },
  {
    code: "CCU",
    name: "Netaji Subhas Chandra Bose International Airport",
    city: "Kolkata",
    country: "India",
    region: "Asia",
  },

  // Middle East
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
  },
  {
    code: "DWC",
    name: "Al Maktoum International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
  },
  {
    code: "AUH",
    name: "Abu Dhabi International Airport",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    region: "Middle East",
  },
  {
    code: "DOH",
    name: "Hamad International Airport",
    city: "Doha",
    country: "Qatar",
    region: "Middle East",
  },
  {
    code: "KWI",
    name: "Kuwait International Airport",
    city: "Kuwait City",
    country: "Kuwait",
    region: "Middle East",
  },
  {
    code: "BAH",
    name: "Bahrain International Airport",
    city: "Manama",
    country: "Bahrain",
    region: "Middle East",
  },
  {
    code: "RUH",
    name: "King Khalid International Airport",
    city: "Riyadh",
    country: "Saudi Arabia",
    region: "Middle East",
  },
  {
    code: "JED",
    name: "King Abdulaziz International Airport",
    city: "Jeddah",
    country: "Saudi Arabia",
    region: "Middle East",
  },
  {
    code: "TLV",
    name: "Ben Gurion Airport",
    city: "Tel Aviv",
    country: "Israel",
    region: "Middle East",
  },

  // Africa
  {
    code: "CAI",
    name: "Cairo International Airport",
    city: "Cairo",
    country: "Egypt",
    region: "Africa",
  },
  {
    code: "CPT",
    name: "Cape Town International Airport",
    city: "Cape Town",
    country: "South Africa",
    region: "Africa",
  },
  {
    code: "JNB",
    name: "O.R. Tambo International Airport",
    city: "Johannesburg",
    country: "South Africa",
    region: "Africa",
  },
  {
    code: "CMN",
    name: "Mohammed V International Airport",
    city: "Casablanca",
    country: "Morocco",
    region: "Africa",
  },
  {
    code: "LOS",
    name: "Murtala Muhammed International Airport",
    city: "Lagos",
    country: "Nigeria",
    region: "Africa",
  },
  {
    code: "ADD",
    name: "Addis Ababa Bole International Airport",
    city: "Addis Ababa",
    country: "Ethiopia",
    region: "Africa",
  },

  // Oceania
  {
    code: "SYD",
    name: "Sydney Kingsford Smith Airport",
    city: "Sydney",
    country: "Australia",
    region: "Oceania",
  },
  {
    code: "MEL",
    name: "Melbourne Airport",
    city: "Melbourne",
    country: "Australia",
    region: "Oceania",
  },
  {
    code: "BNE",
    name: "Brisbane Airport",
    city: "Brisbane",
    country: "Australia",
    region: "Oceania",
  },
  {
    code: "PER",
    name: "Perth Airport",
    city: "Perth",
    country: "Australia",
    region: "Oceania",
  },
  {
    code: "ADL",
    name: "Adelaide Airport",
    city: "Adelaide",
    country: "Australia",
    region: "Oceania",
  },
  {
    code: "AKL",
    name: "Auckland Airport",
    city: "Auckland",
    country: "New Zealand",
    region: "Oceania",
  },
  {
    code: "CHC",
    name: "Christchurch Airport",
    city: "Christchurch",
    country: "New Zealand",
    region: "Oceania",
  },

  // South America
  {
    code: "GRU",
    name: "São Paulo/Guarulhos International Airport",
    city: "São Paulo",
    country: "Brazil",
    region: "South America",
  },
  {
    code: "GIG",
    name: "Rio de Janeiro–Galeão International Airport",
    city: "Rio de Janeiro",
    country: "Brazil",
    region: "South America",
  },
  {
    code: "BSB",
    name: "Brasília International Airport",
    city: "Brasília",
    country: "Brazil",
    region: "South America",
  },
  {
    code: "EZE",
    name: "Ezeiza International Airport",
    city: "Buenos Aires",
    country: "Argentina",
    region: "South America",
  },
  {
    code: "SCL",
    name: "Santiago International Airport",
    city: "Santiago",
    country: "Chile",
    region: "South America",
  },
  {
    code: "LIM",
    name: "Jorge Chávez International Airport",
    city: "Lima",
    country: "Peru",
    region: "South America",
  },
  {
    code: "BOG",
    name: "El Dorado International Airport",
    city: "Bogotá",
    country: "Colombia",
    region: "South America",
  },
  {
    code: "UIO",
    name: "Mariscal Sucre International Airport",
    city: "Quito",
    country: "Ecuador",
    region: "South America",
  },
  {
    code: "CCS",
    name: "Simón Bolívar International Airport",
    city: "Caracas",
    country: "Venezuela",
    region: "South America",
  },
];

/**
 * Search airports by keyword (code, name, city, or country)
 */
export function searchAirports(
  keyword: string,
  limit: number = 10,
): AirportInfo[] {
  if (!keyword || keyword.length < 2) {
    return MAJOR_AIRPORTS.slice(0, limit);
  }

  const searchTerm = keyword.toLowerCase();

  const results = MAJOR_AIRPORTS.filter(
    (airport) =>
      airport.code.toLowerCase().includes(searchTerm) ||
      airport.name.toLowerCase().includes(searchTerm) ||
      airport.city.toLowerCase().includes(searchTerm) ||
      airport.country.toLowerCase().includes(searchTerm),
  );

  // Sort results by relevance
  results.sort((a, b) => {
    // Exact code match first
    if (a.code.toLowerCase() === searchTerm) return -1;
    if (b.code.toLowerCase() === searchTerm) return 1;

    // Code starts with search term
    if (a.code.toLowerCase().startsWith(searchTerm)) return -1;
    if (b.code.toLowerCase().startsWith(searchTerm)) return 1;

    // City starts with search term
    if (a.city.toLowerCase().startsWith(searchTerm)) return -1;
    if (b.city.toLowerCase().startsWith(searchTerm)) return 1;

    // Name starts with search term
    if (a.name.toLowerCase().startsWith(searchTerm)) return -1;
    if (b.name.toLowerCase().startsWith(searchTerm)) return 1;

    return 0;
  });

  return results.slice(0, limit);
}

/**
 * Get airport by code
 */
export function getAirportByCode(code: string): AirportInfo | undefined {
  return MAJOR_AIRPORTS.find(
    (airport) => airport.code.toLowerCase() === code.toLowerCase(),
  );
}

/**
 * Get popular airports by region
 */
export function getAirportsByRegion(
  region: string,
  limit: number = 20,
): AirportInfo[] {
  return MAJOR_AIRPORTS.filter((airport) => airport.region === region).slice(
    0,
    limit,
  );
}

/**
 * Get all regions
 */
export function getAllRegions(): string[] {
  return [...new Set(MAJOR_AIRPORTS.map((airport) => airport.region))];
}
