-- Fix database schema for guest bookings
-- This script updates the bookings table to support guest bookings

-- 1. Make user_id nullable for guest bookings
ALTER TABLE public.bookings ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add contact_phone column if it doesn't exist
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- 3. Add is_guest column to differentiate guest bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- 4. Update existing bookings to set is_guest flag correctly
UPDATE public.bookings SET is_guest = FALSE WHERE user_id IS NOT NULL;
UPDATE public.bookings SET is_guest = TRUE WHERE user_id IS NULL;

-- 5. Create guest booking view if it doesn't exist
CREATE OR REPLACE VIEW public.guest_booking_view AS
SELECT 
  b.id,
  b.pnr,
  b.status,
  b.from_airport_id,
  b.to_airport_id,
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

-- 6. Grant access to the view
GRANT SELECT ON public.guest_booking_view TO anon;
GRANT SELECT ON public.guest_booking_view TO authenticated;

-- 7. Update RLS policies to allow guest bookings
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

-- Create new policies that support guest bookings
-- Authenticated users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings 
FOR SELECT USING (auth.uid() = user_id);

-- Allow creating guest bookings (no user_id) and authenticated bookings
CREATE POLICY "Users can create bookings" ON public.bookings 
FOR INSERT WITH CHECK (
  (auth.uid() = user_id AND is_guest = FALSE) OR 
  (user_id IS NULL AND is_guest = TRUE)
);

-- Allow updating own bookings
CREATE POLICY "Users can update own bookings" ON public.bookings 
FOR UPDATE USING (auth.uid() = user_id);

-- Allow anonymous access to guest bookings for lookup by PNR + email
CREATE POLICY "Anonymous can access guest bookings by PNR" ON public.bookings
FOR SELECT USING (is_guest = true);

-- Similar updates for passengers table
DROP POLICY IF EXISTS "Users can view own booking passengers" ON public.passengers;
DROP POLICY IF EXISTS "Users can create passengers for own bookings" ON public.passengers;

-- Allow viewing passengers for own bookings OR guest bookings
CREATE POLICY "Users can view passengers" ON public.passengers 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = booking_id 
    AND (user_id = auth.uid() OR is_guest = true)
  )
);

-- Allow creating passengers for own bookings OR guest bookings
CREATE POLICY "Users can create passengers" ON public.passengers 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = booking_id 
    AND (
      (user_id = auth.uid() AND is_guest = FALSE) OR 
      (user_id IS NULL AND is_guest = TRUE)
    )
  )
);

-- Add helpful comments
COMMENT ON TABLE public.bookings IS 'Bookings table supporting both authenticated users and guest bookings';
COMMENT ON COLUMN public.bookings.user_id IS 'NULL for guest bookings, UUID for authenticated user bookings';
COMMENT ON COLUMN public.bookings.is_guest IS 'TRUE for guest bookings, FALSE for authenticated user bookings';
COMMENT ON COLUMN public.bookings.contact_phone IS 'Contact phone number, especially useful for guest bookings';

-- Create index for guest booking lookups
CREATE INDEX IF NOT EXISTS idx_bookings_guest_lookup ON public.bookings(pnr, contact_email) WHERE is_guest = true;
CREATE INDEX IF NOT EXISTS idx_bookings_is_guest ON public.bookings(is_guest);

COMMIT;
