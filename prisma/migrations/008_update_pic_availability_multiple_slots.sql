-- Migration: Update PICAvailability to support multiple slots per day with meetingType
-- This removes the unique constraint and adds meetingType field

-- Step 1: Drop the unique constraint on (picId, dayOfWeek)
ALTER TABLE pic_availabilities
DROP CONSTRAINT IF EXISTS pic_availabilities_pic_id_day_of_week_key;

-- Step 2: Add meetingType column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pic_availabilities' 
        AND column_name = 'meeting_type'
    ) THEN
        ALTER TABLE pic_availabilities
        ADD COLUMN meeting_type TEXT NOT NULL DEFAULT 'online';
    END IF;
END $$;

-- Step 3: Convert meeting_type to enum type (MeetingType)
-- First, check if the column is already the correct type
DO $$
BEGIN
    -- Check if we need to alter the column type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pic_availabilities' 
        AND column_name = 'meeting_type'
        AND data_type != 'USER-DEFINED'
    ) THEN
        -- Alter column to use the enum type
        ALTER TABLE pic_availabilities
        ALTER COLUMN meeting_type TYPE "MeetingType" USING meeting_type::"MeetingType";
    END IF;
END $$;

-- Step 4: Remove records with is_available = false before dropping the column
-- (Since all records in the table now represent available slots)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pic_availabilities' 
        AND column_name = 'is_available'
    ) THEN
        -- Delete records that are marked as not available
        -- (They won't be needed since we only store available slots now)
        DELETE FROM pic_availabilities
        WHERE is_available = false;
        
        -- Now drop the column
        ALTER TABLE pic_availabilities
        DROP COLUMN is_available;
    END IF;
END $$;

-- Step 5: Add index on (picId, dayOfWeek) for better query performance
CREATE INDEX IF NOT EXISTS idx_pic_availabilities_pic_id_day_of_week 
ON pic_availabilities(pic_id, day_of_week);

-- Step 6: Update existing data to have meetingType = 'online' if it's null (shouldn't happen due to default, but just in case)
UPDATE pic_availabilities
SET meeting_type = 'online'
WHERE meeting_type IS NULL;

