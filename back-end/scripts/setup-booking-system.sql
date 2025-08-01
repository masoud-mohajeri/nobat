-- Booking System Database Setup
-- Run this script to create the booking system tables

-- Create booking status enum
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled');

-- Create slot status enum
CREATE TYPE slot_status AS ENUM ('free', 'booked', 'blocked');

-- Create stylist_availabilities table
CREATE TABLE stylist_availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stylist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Daily work configuration
    monday_start TIME,
    monday_end TIME,
    tuesday_start TIME,
    tuesday_end TIME,
    wednesday_start TIME,
    wednesday_end TIME,
    thursday_start TIME,
    thursday_end TIME,
    friday_start TIME,
    friday_end TIME,
    saturday_start TIME,
    saturday_end TIME,
    sunday_start TIME,
    sunday_end TIME,
    
    -- Slot configuration
    slot_duration_minutes INTEGER DEFAULT 60,
    buffer_time_minutes INTEGER DEFAULT 15,
    minimum_notice_minutes INTEGER DEFAULT 120,
    max_advance_days INTEGER DEFAULT 90,
    allow_multiple_clients BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stylist_exceptions table
CREATE TABLE stylist_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stylist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stylist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status booking_status DEFAULT 'pending',
    deposit_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    customer_notes TEXT,
    stylist_notes TEXT,
    cancellation_reason VARCHAR(255),
    cancelled_by VARCHAR(50),
    cancelled_at TIMESTAMP,
    rescheduled_from UUID REFERENCES bookings(id),
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    reminder_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_stylist_availabilities_stylist_id ON stylist_availabilities(stylist_id);
CREATE INDEX idx_stylist_exceptions_stylist_id ON stylist_exceptions(stylist_id);
CREATE INDEX idx_stylist_exceptions_date ON stylist_exceptions(date);
CREATE INDEX idx_bookings_stylist_id ON bookings(stylist_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);

-- Add comments for documentation
COMMENT ON TABLE stylist_availabilities IS 'Stores stylist working hours and slot configuration';
COMMENT ON TABLE stylist_exceptions IS 'Stores stylist exceptions (personal days off, busy periods)';
COMMENT ON TABLE bookings IS 'Stores appointment bookings between stylists and customers';

COMMENT ON COLUMN stylist_availabilities.slot_duration_minutes IS 'Duration of each booking slot in minutes';
COMMENT ON COLUMN stylist_availabilities.buffer_time_minutes IS 'Time between appointments in minutes';
COMMENT ON COLUMN stylist_availabilities.minimum_notice_minutes IS 'Minimum notice required for booking in minutes';
COMMENT ON COLUMN stylist_availabilities.max_advance_days IS 'Maximum days in advance for booking';
COMMENT ON COLUMN stylist_availabilities.allow_multiple_clients IS 'Whether stylist can serve multiple clients simultaneously';

COMMENT ON COLUMN stylist_exceptions.is_recurring IS 'Whether this exception repeats weekly';
COMMENT ON COLUMN stylist_exceptions.recurring_day_of_week IS 'Day of week for recurring exceptions (0=Sunday, 6=Saturday)';

COMMENT ON COLUMN bookings.status IS 'Current status of the booking';
COMMENT ON COLUMN bookings.deposit_amount IS 'Amount paid as deposit';
COMMENT ON COLUMN bookings.total_amount IS 'Total service amount';
COMMENT ON COLUMN bookings.rescheduled_from IS 'Original booking ID if this was rescheduled';
COMMENT ON COLUMN bookings.reminder_sent_at IS 'When 24h reminder was sent'; 