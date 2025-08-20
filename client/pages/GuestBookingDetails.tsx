import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeft, Mail, Phone } from 'lucide-react';

interface GuestBooking {
  id: string;
  pnr: string;
  status: string;
  route: {
    from: { code: string; name: string; city: string; country: string };
    to: { code: string; name: string; city: string; country: string };
    departureDate: string;
    returnDate?: string;
    tripType: string;
  };
  passengers: Array<{
    title: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  totalAmount: number;
  currency: string;
  createdAt: string;
  ticketUrl?: string;
  isGuest: boolean;
}

export default function GuestBookingDetails() {
  const { pnr } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<GuestBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load from localStorage first
    const savedBooking = localStorage.getItem('guestBooking');
    if (savedBooking) {
      try {
        const bookingData = JSON.parse(savedBooking);
        if (bookingData.pnr === pnr) {
          setBooking(bookingData);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error parsing saved booking:', error);
      }
    }

    // If not found in localStorage, redirect to lookup
    navigate('/guest-booking-lookup');
  }, [pnr, navigate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadTicket = () => {
    if (booking?.ticketUrl) {
      window.open(booking.ticketUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ticket-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Booking not found</p>
            <Button onClick={() => navigate('/guest-booking-lookup')}>
              Look Up Another Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/guest-booking-lookup')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lookup
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600">Reference: {booking.pnr}</p>
            </div>
          </div>
          
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.toUpperCase()}
          </Badge>
        </div>

        {/* Flight Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✈️ Flight Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Route</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{booking.route.from.code}</span>
                    <span className="text-gray-600">→</span>
                    <span className="font-medium">{booking.route.to.code}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {booking.route.from.city}, {booking.route.from.country} to{' '}
                    {booking.route.to.city}, {booking.route.to.country}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Travel Dates</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Departure:</span> {new Date(booking.route.departureDate).toLocaleDateString()}</p>
                  {booking.route.returnDate && (
                    <p><span className="font-medium">Return:</span> {new Date(booking.route.returnDate).toLocaleDateString()}</p>
                  )}
                  <p><span className="font-medium">Trip Type:</span> {booking.route.tripType}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passengers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>👥 Passengers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {booking.passengers.map((passenger, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {passenger.title} {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {passenger.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>💳 Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-2xl font-bold text-ticket-primary">
                  {booking.currency} {booking.totalAmount}
                </p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Booking Date</p>
                <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {booking.ticketUrl && (
                <Button onClick={handleDownloadTicket} className="bg-ticket-primary hover:bg-ticket-darker">
                  <Download className="h-4 w-4 mr-2" />
                  Download E-Ticket
                </Button>
              )}
              
              <Button variant="outline" onClick={() => navigate('/contact')}>
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              
              <Button variant="outline" onClick={() => navigate('/')}>
                Book Another Flight
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
