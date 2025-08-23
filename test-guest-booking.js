const fetch = require('node-fetch');

// Test guest booking creation
async function testGuestBooking() {
  const bookingData = {
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
    guestCheckout: true,
    totalAmount: 15
  };

  try {
    console.log('Testing guest booking API...');
    console.log('Payload:', JSON.stringify(bookingData, null, 2));
    
    const response = await fetch('http://localhost:8080/api/guest/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Guest booking created successfully!');
      console.log('PNR:', result.booking.pnr);
    } else {
      console.log('❌ Guest booking failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing guest booking:', error.message);
  }
}

testGuestBooking();
