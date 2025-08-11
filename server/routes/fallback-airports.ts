import { Router } from "express";

const router = Router();

// Fallback airports data when Supabase is not available
const fallbackAirports = [
  {
    id: "1",
    code: "RFD",
    name: "Chicago Rockford International Airport",
    city: "Chicago",
    country: "USA",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    code: "ORY",
    name: "Paris Orly Airport",
    city: "Paris",
    country: "France",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "UK",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "USA",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "USA",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "UAE",
    created_at: new Date().toISOString(),
  },
  {
    id: "7",
    code: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    created_at: new Date().toISOString(),
  },
  {
    id: "8",
    code: "NRT",
    name: "Narita International Airport",
    city: "Tokyo",
    country: "Japan",
    created_at: new Date().toISOString(),
  },
  {
    id: "9",
    code: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
    created_at: new Date().toISOString(),
  },
  {
    id: "10",
    code: "AMS",
    name: "Amsterdam Airport Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
    created_at: new Date().toISOString(),
  },
  {
    id: "11",
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    created_at: new Date().toISOString(),
  },
  {
    id: "12",
    code: "MIA",
    name: "Miami International Airport",
    city: "Miami",
    country: "USA",
    created_at: new Date().toISOString(),
  },
  {
    id: "13",
    code: "BOS",
    name: "Logan International Airport",
    city: "Boston",
    country: "USA",
    created_at: new Date().toISOString(),
  },
  {
    id: "14",
    code: "ATL",
    name: "Hartsfield-Jackson Atlanta International Airport",
    city: "Atlanta",
    country: "USA",
    created_at: new Date().toISOString(),
  },
  {
    id: "15",
    code: "ORD",
    name: "Chicago O'Hare International Airport",
    city: "Chicago",
    country: "USA",
    created_at: new Date().toISOString(),
  },
];

// GET /api/airports - Fallback airports endpoint
router.get("/airports", async (req, res) => {
  try {
    // Try to get airports from Supabase first
    const { supabaseServerHelpers } = await import("../lib/supabaseServer");
    const result = await supabaseServerHelpers.getAllAirports();

    if (result && result.data && result.data.length > 0) {
      return res.json({ data: result.data, error: null });
    }
  } catch (error) {
    console.warn("Supabase airports fetch failed, using fallback");
  }

  // Return fallback airports
  res.json({ data: fallbackAirports, error: null });
});

export { router as fallbackAirportsRouter };
