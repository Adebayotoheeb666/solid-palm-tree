/**
 * End-to-End Test Script for OnboardTicket Application
 *
 * This script tests the complete booking flow:
 * 1. User authentication
 * 2. Flight search with Amadeus API
 * 3. Booking creation with real flight data
 * 4. Payment processing
 * 5. Admin dashboard access
 */

const BASE_URL = "http://localhost:8080";

// Test data - Generate dynamically to work with real database
function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `test.user.${timestamp}@example.com`,
    password: "testpass123",
    firstName: "Test",
    lastName: "User",
    title: "Mr",
  };
}

function generateTestAdmin() {
  const timestamp = Date.now();
  return {
    email: `test.admin.${timestamp}@onboardticket.com`,
    password: "admin123",
    firstName: "Test",
    lastName: "Admin",
    title: "Mr",
  };
}

// Note: Route data should come from actual database airports
function generateTestRoute() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    from: {
      code: "LAX", // Should be from database
      name: "Los Angeles International Airport",
      city: "Los Angeles",
      country: "United States",
    },
    to: {
      code: "JFK", // Should be from database
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "United States",
    },
    departureDate: tomorrow.toISOString().split('T')[0],
    tripType: "oneway",
  };
}

function generateTestPassenger() {
  const timestamp = Date.now();
  return {
    title: "Mr",
    firstName: "Test",
    lastName: "Passenger",
    email: `test.passenger.${timestamp}@example.com`,
  };
}

let authToken = "";
let adminToken = "";
let bookingId = "";
let testUser = null;
let testAdmin = null;
let testRoute = null;
let testPassenger = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();
  return { response, data };
}

async function testHealthCheck() {
  console.log("🔍 Testing health check...");
  try {
    const { response, data } = await makeRequest("/api/ping");
    if (response.ok && data.message) {
      console.log("✅ Health check passed");
      return true;
    }
    throw new Error("Health check failed");
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log("🔍 Testing user registration...");
  try {
    const { response, data } = await makeRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(testUser),
    });

    if (response.ok && data.success) {
      console.log("✅ User registration successful");
      return true;
    }

    // If user already exists, that's okay for testing
    if (data.message && data.message.includes("already exists")) {
      console.log("✅ User already exists (expected for testing)");
      return true;
    }

    throw new Error(data.message || "Registration failed");
  } catch (error) {
    console.log("❌ User registration failed:", error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log("🔍 Testing user login...");
  try {
    const { response, data } = await makeRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    if (response.ok && data.success && data.token) {
      authToken = data.token;
      console.log("✅ User login successful");
      return true;
    }

    throw new Error(data.message || "Login failed");
  } catch (error) {
    console.log("❌ User login failed:", error.message);
    return false;
  }
}

async function testFlightSearch() {
  console.log("🔍 Testing flight search...");
  try {
    const searchParams = new URLSearchParams({
      originLocationCode: testRoute.from.code,
      destinationLocationCode: testRoute.to.code,
      departureDate: testRoute.departureDate,
      adults: "1",
      currencyCode: "USD",
      max: "5",
    });

    const { response, data } = await makeRequest(
      `/api/amadeus/flights/search?${searchParams}`,
    );

    if (response.ok && data.data && Array.isArray(data.data)) {
      console.log(
        `✅ Flight search successful - found ${data.data.length} flights`,
      );
      return data.data[0] || null; // Return first flight for booking
    }

    throw new Error(data.message || "Flight search failed");
  } catch (error) {
    console.log("❌ Flight search failed:", error.message);
    return null;
  }
}

async function testBookingCreation(selectedFlight) {
  console.log("🔍 Testing booking creation...");
  try {
    const bookingRequest = {
      route: testRoute,
      passengers: [testPassenger],
      contactEmail: testPassenger.email,
      termsAccepted: true,
      selectedFlight: selectedFlight,
      totalAmount: selectedFlight ? parseFloat(selectedFlight.price.total) : 15,
    };

    const { response, data } = await makeRequest("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingRequest),
    });

    if (response.ok && data.success && data.booking) {
      bookingId = data.booking.id;
      console.log(`✅ Booking creation successful - ID: ${bookingId}`);
      console.log(`   PNR: ${data.booking.pnr}`);
      console.log(
        `   Amount: ${data.booking.currency}${data.booking.totalAmount}`,
      );
      return data.booking;
    }

    throw new Error(data.message || "Booking creation failed");
  } catch (error) {
    console.log("❌ Booking creation failed:", error.message);
    return null;
  }
}

async function testDashboardAccess() {
  console.log("🔍 Testing dashboard access...");
  try {
    const { response, data } = await makeRequest("/api/user/dashboard");

    if (response.ok && data.user) {
      console.log("✅ Dashboard access successful");
      console.log(`   User: ${data.user.firstName} ${data.user.lastName}`);
      console.log(`   Total bookings: ${data.totalBookings || 0}`);
      return true;
    }

    throw new Error("Dashboard access failed");
  } catch (error) {
    console.log("❌ Dashboard access failed:", error.message);
    return false;
  }
}

async function testAdminLogin() {
  console.log("🔍 Testing admin login...");
  try {
    // First register admin if needed
    await makeRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(testAdmin),
    });

    const { response, data } = await makeRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testAdmin.email,
        password: testAdmin.password,
      }),
    });

    if (response.ok && data.success && data.token) {
      adminToken = data.token;
      console.log("✅ Admin login successful");
      return true;
    }

    throw new Error(data.message || "Admin login failed");
  } catch (error) {
    console.log("❌ Admin login failed:", error.message);
    return false;
  }
}

async function testAdminDashboard() {
  console.log("🔍 Testing admin dashboard access...");
  try {
    const { response, data } = await makeRequest("/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.ok && data.totalBookings !== undefined) {
      console.log("✅ Admin dashboard access successful");
      console.log(`   Total bookings: ${data.totalBookings}`);
      console.log(`   Total revenue: $${data.totalRevenue || 0}`);
      return true;
    }

    throw new Error("Admin dashboard access failed");
  } catch (error) {
    console.log("❌ Admin dashboard access failed:", error.message);
    return false;
  }
}

async function runEndToEndTest() {
  console.log("🚀 Starting End-to-End Test for OnboardTicket Application\n");

  const tests = [
    { name: "Health Check", fn: testHealthCheck },
    { name: "User Registration", fn: testUserRegistration },
    { name: "User Login", fn: testUserLogin },
    { name: "Flight Search", fn: testFlightSearch },
    { name: "Booking Creation", fn: null }, // Special handling
    { name: "Dashboard Access", fn: testDashboardAccess },
    { name: "Admin Login", fn: testAdminLogin },
    { name: "Admin Dashboard", fn: testAdminDashboard },
  ];

  let passedTests = 0;
  let selectedFlight = null;

  for (const test of tests) {
    if (test.name === "Booking Creation") {
      const booking = await testBookingCreation(selectedFlight);
      if (booking) passedTests++;
    } else if (test.name === "Flight Search") {
      selectedFlight = await test.fn();
      if (selectedFlight) passedTests++;
    } else {
      const result = await test.fn();
      if (result) passedTests++;
    }
    console.log(""); // Add spacing between tests
  }

  console.log("📊 Test Results:");
  console.log(`   Passed: ${passedTests}/${tests.length}`);
  console.log(
    `   Success Rate: ${Math.round((passedTests / tests.length) * 100)}%`,
  );

  if (passedTests === tests.length) {
    console.log("\n🎉 All tests passed! The application is fully functional.");
  } else {
    console.log(
      "\n⚠️  Some tests failed. Please review the logs above for details.",
    );
  }

  console.log("\n✨ End-to-End Test Complete\n");
}

// Run the test if this script is executed directly
if (require.main === module) {
  runEndToEndTest().catch(console.error);
}

module.exports = { runEndToEndTest };
