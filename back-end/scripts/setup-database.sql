-- Create the database (run this as superuser)
-- CREATE DATABASE nobat_db;

-- Connect to the database
-- \c nobat_db;

-- Create user role enum
CREATE TYPE user_role AS ENUM ('user', 'provider', 'admin');

-- Create user status enum
CREATE TYPE user_status AS ENUM ('pending', 'active', 'locked', 'inactive');

-- Create OTP type enum
CREATE TYPE otp_type AS ENUM ('phone_verification', 'password_reset', 'account_unlock', 'login');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(11) UNIQUE NOT NULL,
    password VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'pending',
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login_at TIMESTAMP,
    last_login_at TIMESTAMP,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    phone_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    replaced_by_token VARCHAR(255),
    reason_revoked VARCHAR(100),
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create otps table
CREATE TABLE otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(11) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type otp_type NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_otps_phone_number ON otps(phone_number);
CREATE INDEX idx_otps_code ON otps(code);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a test admin user (optional)
-- INSERT INTO users (phone_number, first_name, last_name, role, status, is_phone_verified, phone_verified_at)
-- VALUES ('09123456789', 'Admin', 'User', 'admin', 'active', TRUE, CURRENT_TIMESTAMP); 