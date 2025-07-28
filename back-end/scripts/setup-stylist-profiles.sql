-- Create stylist profile status enum
CREATE TYPE stylist_profile_status AS ENUM (
  'draft',
  'pending_approval', 
  'approved',
  'rejected',
  'suspended'
);

-- Create stylist_profiles table
CREATE TABLE stylist_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_photo VARCHAR(255),
    salon_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    instagram_username VARCHAR(100),
    status stylist_profile_status DEFAULT 'draft',
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    submitted_for_approval_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_stylist_profiles_user_id ON stylist_profiles(user_id);
CREATE INDEX idx_stylist_profiles_status ON stylist_profiles(status);
CREATE INDEX idx_stylist_profiles_approved ON stylist_profiles(status) WHERE status = 'approved';

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stylist_profiles_updated_at 
    BEFORE UPDATE ON stylist_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 