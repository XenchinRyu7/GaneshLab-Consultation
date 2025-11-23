-- Migration: 012_add_reschedule_meeting_link
-- Description: Add new_meeting_link field to reschedule_requests table
-- Date: 2025-11-23

-- Add new_meeting_link column to reschedule_requests
ALTER TABLE reschedule_requests
ADD COLUMN IF NOT EXISTS new_meeting_link TEXT;

-- Add comment
COMMENT ON COLUMN reschedule_requests.new_meeting_link IS 'New meeting link for rescheduled appointment (auto-generated or null if offline)';
