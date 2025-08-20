-- Migration to support guest bookings
-- This script modifies the existing database schema to allow guest bookings

-- 1. Make user_id nullable in bookings table (for guest bookings)
ALTER TABLE public.bookings ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add fields for guest bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- 3. Update the trip_type constraint to include both formats
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_trip_type_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_trip_type_check 
  CHECK (trip_type IN ('oneway', 'roundtrip', 'one-way', 'round-trip'));

-- 4. Create index for guest booking lookups
CREATE INDEX IF NOT EXISTS idx_bookings_guest_lookup ON public.bookings(pnr, contact_email, is_guest);

-- 5. Update RLS policies to allow guest bookings

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

-- Create new policies that support both authenticated users and guest bookings
CREATE POLICY "Allow authenticated user bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND user_id IS NOT NULL
  );

CREATE POLICY "Allow guest bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    user_id IS NULL AND is_guest = true
  );

CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- 6. Update passengers table policies for guest bookings
DROP POLICY IF EXISTS "Users can add passengers to their bookings" ON public.passengers;
DROP POLICY IF EXISTS "Users can view passengers for their bookings" ON public.passengers;

CREATE POLICY "Allow passengers for user bookings" ON public.passengers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id AND auth.uid() = user_id
    )
  );

CREATE POLICY "Allow passengers for guest bookings" ON public.passengers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id AND user_id IS NULL AND is_guest = true
    )
  );

CREATE POLICY "Users can view passengers for their bookings" ON public.passengers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id AND (auth.uid() = user_id OR user_id IS NULL)
    )
  );

-- 7. Update transactions table policies if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    
    DROP POLICY IF EXISTS "Users can create transactions for their bookings" ON public.transactions;
    DROP POLICY IF EXISTS "Users can view transactions for their bookings" ON public.transactions;
    
    CREATE POLICY "Users can create transactions for their bookings" ON public.transactions
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.bookings 
          WHERE id = booking_id AND (auth.uid() = user_id OR user_id IS NULL)
        )
      );
    
    CREATE POLICY "Users can view transactions for their bookings" ON public.transactions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.bookings 
          WHERE id = booking_id AND (auth.uid() = user_id OR user_id IS NULL)
        )
      );
  END IF;
END $$;

-- 8. Grant permissions for guest bookings (allow anonymous access to specific operations)
GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT ON public.passengers TO anon;
GRANT SELECT ON public.airports TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 9. Create a view for guest booking lookups (optional, for easier querying)
CREATE OR REPLACE VIEW public.guest_booking_view AS
SELECT 
  b.id,
  b.pnr,
  b.status,
  b.departure_date,
  b.return_date,
  b.trip_type,
  b.total_amount,
  b.currency,
  b.contact_email,
  b.contact_phone,
  b.ticket_url,
  b.created_at,
  b.updated_at,
  fa.code as from_airport_code,
  fa.name as from_airport_name,
  fa.city as from_city,
  fa.country as from_country,
  ta.code as to_airport_code,
  ta.name as to_airport_name,
  ta.city as to_city,
  ta.country as to_country
FROM public.bookings b
LEFT JOIN public.airports fa ON b.from_airport_id = fa.id
LEFT JOIN public.airports ta ON b.to_airport_id = ta.id
WHERE b.is_guest = true;

-- Grant access to the view
GRANT SELECT ON public.guest_booking_view TO anon;
GRANT SELECT ON public.guest_booking_view TO authenticated;

COMMENT ON TABLE public.bookings IS 'Bookings table supporting both authenticated users and guest bookings';
COMMENT ON COLUMN public.bookings.user_id IS 'NULL for guest bookings, UUID for authenticated user bookings';
COMMENT ON COLUMN public.bookings.is_guest IS 'TRUE for guest bookings, FALSE for authenticated user bookings';
COMMENT ON COLUMN public.bookings.contact_phone IS 'Contact phone number, especially useful for guest bookings';
