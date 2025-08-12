-- OnboardTicket Database Schema Setup for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(10) CHECK (title IN ('Mr', 'Ms', 'Mrs')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create airports table
CREATE TABLE IF NOT EXISTS public.airports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    pnr VARCHAR(10) UNIQUE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')) DEFAULT 'pending',
    from_airport_id UUID REFERENCES public.airports(id),
    to_airport_id UUID REFERENCES public.airports(id),
    departure_date DATE NOT NULL,
    return_date DATE,
    trip_type VARCHAR(10) CHECK (trip_type IN ('oneway', 'roundtrip')) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    contact_email VARCHAR(255) NOT NULL,
    terms_accepted BOOLEAN DEFAULT FALSE,
    selected_flight JSONB,
    ticket_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create passengers table
CREATE TABLE IF NOT EXISTS public.passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    title VARCHAR(10) CHECK (title IN ('Mr', 'Ms', 'Mrs')) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    payment_method VARCHAR(20),
    payment_details JSONB,
    stripe_payment_intent_id VARCHAR(255),
    paypal_order_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    category VARCHAR(20) CHECK (category IN ('booking', 'payment', 'technical', 'general')) DEFAULT 'general',
    admin_response TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON public.bookings(pnr);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_passengers_booking_id ON public.passengers(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON public.transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_airports_code ON public.airports(code);

-- Create booking summary view for admin dashboard
CREATE OR REPLACE VIEW public.booking_summary AS
SELECT 
    b.id,
    b.pnr,
    b.status,
    b.user_id,
    u.email as user_email,
    u.first_name,
    u.last_name,
    fa.code as from_airport_code,
    fa.name as from_airport_name,
    fa.city as from_airport_city,
    fa.country as from_airport_country,
    ta.code as to_airport_code,
    ta.name as to_airport_name,
    ta.city as to_airport_city,
    ta.country as to_airport_country,
    b.departure_date,
    b.return_date,
    b.trip_type,
    b.total_amount,
    b.currency,
    b.contact_email,
    b.created_at,
    b.updated_at
FROM public.bookings b
LEFT JOIN public.users u ON b.user_id = u.id
LEFT JOIN public.airports fa ON b.from_airport_id = fa.id
LEFT JOIN public.airports ta ON b.to_airport_id = ta.id;

-- Create admin dashboard stats view
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.bookings) as total_bookings,
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.bookings WHERE status = 'confirmed') as total_revenue,
    (SELECT COUNT(DISTINCT user_id) FROM public.bookings) as active_users,
    (SELECT COUNT(*) FROM public.bookings WHERE status = 'confirmed') as confirmed_bookings,
    (SELECT COUNT(*) FROM public.bookings WHERE status = 'pending') as pending_bookings,
    (SELECT COUNT(*) FROM public.bookings WHERE status = 'cancelled') as cancelled_bookings,
    (SELECT COALESCE(AVG(total_amount), 0) FROM public.bookings WHERE status = 'confirmed') as average_booking_value;

-- Insert sample airports
INSERT INTO public.airports (code, name, city, country) VALUES
('JFK', 'John F. Kennedy International Airport', 'New York', 'United States'),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'United States'),
('LHR', 'London Heathrow Airport', 'London', 'United Kingdom'),
('CDG', 'Charles de Gaulle Airport', 'Paris', 'France'),
('DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates'),
('NRT', 'Narita International Airport', 'Tokyo', 'Japan'),
('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore'),
('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany'),
('AMS', 'Amsterdam Airport Schiphol', 'Amsterdam', 'Netherlands'),
('SYD', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia'),
('YYZ', 'Toronto Pearson International Airport', 'Toronto', 'Canada'),
('ORD', 'Chicago O\'Hare International Airport', 'Chicago', 'United States'),
('ATL', 'Hartsfield-Jackson Atlanta International Airport', 'Atlanta', 'United States'),
('DEN', 'Denver International Airport', 'Denver', 'United States'),
('SEA', 'Seattle-Tacoma International Airport', 'Seattle', 'United States'),
('SFO', 'San Francisco International Airport', 'San Francisco', 'United States'),
('LAS', 'Harry Reid International Airport', 'Las Vegas', 'United States'),
('MIA', 'Miami International Airport', 'Miami', 'United States'),
('BOS', 'Logan International Airport', 'Boston', 'United States'),
('ORY', 'Paris Orly Airport', 'Paris', 'France'),
('RFD', 'Chicago Rockford International Airport', 'Chicago', 'United States')
ON CONFLICT (code) DO NOTHING;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the current user's email contains 'admin' or 'onboard@admin.com'
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND (email ILIKE '%admin%' OR email = 'onboard@admin.com')
    );
END;
$$;

-- Create function to cleanup expired bookings
CREATE OR REPLACE FUNCTION public.cleanup_expired_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Mark bookings as expired if departure date has passed and status is still pending
    UPDATE public.bookings 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' 
    AND departure_date < CURRENT_DATE;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and edit their own data
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see passengers for their own bookings
CREATE POLICY "Users can view own booking passengers" ON public.passengers FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create passengers for own bookings" ON public.passengers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own support tickets
CREATE POLICY "Users can view own support tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create support tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own support tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (admins can see everything)
CREATE POLICY "Admins can view all users" ON public.users FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can view all passengers" ON public.passengers FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can view all support tickets" ON public.support_tickets FOR ALL USING (public.is_admin());

-- Make airports table publicly readable
ALTER TABLE public.airports DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.airports TO anon, authenticated;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.passengers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT SELECT ON public.booking_summary TO authenticated;
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
