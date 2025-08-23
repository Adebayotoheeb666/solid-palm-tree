// Direct test of the booking API
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

console.log('Testing guest booking API...');
console.log('Booking data:', JSON.stringify(testBooking, null, 2));

// Test the API
fetch('http://localhost:8080/api/guest/bookings', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testBooking)
})
.then(response => {
    console.log('Response status:', response.status);
    return response.json();
})
.then(result => {
    console.log('Response:', JSON.stringify(result, null, 2));
    if (result.success) {
        console.log('✅ BOOKING TEST PASSED');
        console.log('Booking ID:', result.booking.id);
        console.log('PNR:', result.booking.pnr);
    } else {
        console.log('❌ BOOKING TEST FAILED');
        console.log('Error:', result.message);
    }
})
.catch(error => {
    console.log('❌ BOOKING TEST ERROR');
    console.log('Error:', error.message);
});
