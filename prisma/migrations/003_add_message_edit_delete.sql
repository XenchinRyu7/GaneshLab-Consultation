-- Add isDeleted and editedAt columns to messages table
ALTER TABLE "messages" 
ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "edited_at" TIMESTAMP(3);

-- Create index on is_deleted for better query performance
CREATE INDEX IF NOT EXISTS "messages_is_deleted_idx" ON "messages"("is_deleted");

-- Update existing messages to have is_deleted = false
UPDATE "messages" SET "is_deleted" = false WHERE "is_deleted" IS NULL;

