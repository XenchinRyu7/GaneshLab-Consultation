-- Add cleared fields to conversations table for WhatsApp-like clear conversation feature
-- This allows users to clear conversations on their side without affecting the other user

-- Add cleared_by_client_at column
ALTER TABLE "conversations" 
ADD COLUMN IF NOT EXISTS "cleared_by_client_at" TIMESTAMP(3);

-- Add cleared_by_pic_at column
ALTER TABLE "conversations" 
ADD COLUMN IF NOT EXISTS "cleared_by_pic_at" TIMESTAMP(3);

-- Create indexes for better query performance when filtering cleared conversations
CREATE INDEX IF NOT EXISTS "conversations_cleared_by_client_at_idx" ON "conversations" ("cleared_by_client_at");
CREATE INDEX IF NOT EXISTS "conversations_cleared_by_pic_at_idx" ON "conversations" ("cleared_by_pic_at");

