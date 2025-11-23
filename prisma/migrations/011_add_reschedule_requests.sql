-- Add reschedule request functionality
-- Migration: 011_add_reschedule_requests

-- Create reschedule status enum
CREATE TYPE "RescheduleStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Create reschedule_requests table
CREATE TABLE IF NOT EXISTS reschedule_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  requested_by_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  new_date TIMESTAMP WITH TIME ZONE NOT NULL,
  new_start_time TEXT NOT NULL,
  new_end_time TEXT NOT NULL,
  reason TEXT,
  status "RescheduleStatus" DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for reschedule_requests
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_appointment_id ON reschedule_requests(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_requested_by_id ON reschedule_requests(requested_by_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_status ON reschedule_requests(status);

-- Add updated_at trigger for reschedule_requests
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reschedule_requests_updated_at
    BEFORE UPDATE ON reschedule_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();