import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GuestBookingLookup() {
  const navigate = useNavigate();
  const [pnr, setPnr] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pnr.trim() || !email.trim()) {
      setError('Please enter both PNR and email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/guest/bookings/${pnr}?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (result.success && result.booking) {
        // Store guest booking data and navigate to booking details
        localStorage.setItem('guestBooking', JSON.stringify(result.booking));
        navigate(`/guest-booking/${pnr}`);
      } else {
        setError(result.message || 'Booking not found. Please check your PNR and email address.');
      }
    } catch (error) {
      console.error('Error looking up guest booking:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ticket-primary to-ticket-darker flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-ticket-primary">
            Find Your Booking
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Enter your booking reference (PNR) and email to view your booking details
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label htmlFor="pnr" className="block text-sm font-medium text-gray-700 mb-1">
                Booking Reference (PNR)
              </label>
              <Input
                id="pnr"
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="uppercase"
                maxLength={10}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-ticket-primary hover:bg-ticket-darker"
              disabled={loading}
            >
              {loading ? 'Looking up...' : 'Find My Booking'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help finding your booking?{' '}
              <button
                onClick={() => navigate('/contact')}
                className="text-ticket-primary hover:underline"
              >
                Contact Support
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-ticket-primary hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
