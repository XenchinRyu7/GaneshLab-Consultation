-- Add Google Calendar integration fields to user_profiles table
-- Migration: 009_add_google_calendar_fields

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expiry TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.google_access_token IS 'Google OAuth access token for calendar integration';
COMMENT ON COLUMN user_profiles.google_refresh_token IS 'Google OAuth refresh token for calendar integration';
COMMENT ON COLUMN user_profiles.google_token_expiry IS 'Google OAuth token expiry timestamp';