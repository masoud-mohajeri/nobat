-- Customer Profile System Setup
-- This script sets up the database for customer profile functionality
-- Note: No new fields are needed as we're using existing user fields

-- Add comments to existing columns for clarity
COMMENT ON COLUMN users.first_name IS 'Customer first name (also used for stylists)';
COMMENT ON COLUMN users.last_name IS 'Customer last name (also used for stylists)';
COMMENT ON COLUMN users.birth_date IS 'Customer birth date (also used for stylists)';
COMMENT ON COLUMN users.role IS 'User role: user (customer), provider (stylist), admin';

-- Create index for customer queries (if needed for performance)
-- CREATE INDEX idx_users_role_status ON users(role, status);

-- Add any future customer-specific fields here if needed
-- For example:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_preferences JSONB;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_notes TEXT;

-- Grant necessary permissions (adjust as needed)
-- GRANT SELECT, UPDATE ON users TO nobat_app_user; 