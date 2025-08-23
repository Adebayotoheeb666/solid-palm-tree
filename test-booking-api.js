// Simple test script to verify booking API
async function testBookingAPI() {
  const testBooking = {
    route: {
      from: {
        code: "LAX",
        name: "Los Angeles International Airport",
        city: "Los Angeles",
        country: "United States"
      },
      to: {
        code: "JFK", 
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "United States"
      },
      departureDate: "2024-02-15",
      tripType: "oneway"
    },
    passengers: [{
      title: "Mr",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com"
    }],
    contactEmail: "test@example.com",
    termsAccepted: true,
    guestCheckout: true
  };

  try {
    console.log('Testing guest booking API...');
    const response = await fetch('/api/guest/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Booking API test PASSED');
      console.log('Booking ID:', result.booking.id);
      console.log('PNR:', result.booking.pnr);
      return true;
    } else {
      console.log('❌ Booking API test FAILED');
      console.log('Error:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Booking API test ERROR');
    console.log('Error:', error.message);
    return false;
  }
}

// Add button to page for manual testing
if (typeof window !== 'undefined') {
  window.testBookingAPI = testBookingAPI;
  
  // Add test button to page
  const testButton = document.createElement('button');
  testButton.textContent = 'Test Booking API';
  testButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;';
  testButton.onclick = testBookingAPI;
  document.body.appendChild(testButton);
}

console.log('Booking API test script loaded. Call testBookingAPI() to test.');
