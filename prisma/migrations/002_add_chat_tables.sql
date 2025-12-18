-- Create Projects table
CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "client_id" TEXT NOT NULL,
    "pic_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Create Conversations table
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "pic_id" TEXT NOT NULL,
    "project_id" TEXT,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- Create Messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "projects_client_id_idx" ON "projects"("client_id");
CREATE INDEX IF NOT EXISTS "projects_pic_id_idx" ON "projects"("pic_id");
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects"("status");

CREATE INDEX IF NOT EXISTS "conversations_client_id_idx" ON "conversations"("client_id");
CREATE INDEX IF NOT EXISTS "conversations_pic_id_idx" ON "conversations"("pic_id");
CREATE INDEX IF NOT EXISTS "conversations_project_id_idx" ON "conversations"("project_id");
CREATE INDEX IF NOT EXISTS "conversations_last_message_at_idx" ON "conversations"("last_message_at");

CREATE INDEX IF NOT EXISTS "messages_conversation_id_idx" ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "messages_sender_id_idx" ON "messages"("sender_id");
CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "messages"("created_at");

-- Create unique constraint for conversations
-- Note: This allows multiple conversations with the same client-PIC pair if projectId is null
-- To enforce one conversation per client-PIC pair when projectId is null, you may need a partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS "conversations_client_id_pic_id_project_id_key"
ON "conversations"("client_id", "pic_id", "project_id")
WHERE "project_id" IS NOT NULL;

-- Create partial unique index for conversations without project
-- This ensures only one conversation per client-PIC pair when projectId is null
CREATE UNIQUE INDEX IF NOT EXISTS "conversations_client_id_pic_id_null_project_key"
ON "conversations"("client_id", "pic_id")
WHERE "project_id" IS NULL;

-- Enable Realtime for Supabase (run this in Supabase SQL Editor)
-- ALTER PUBLICATION supabase_realtime ADD TABLE "conversations";
-- ALTER PUBLICATION supabase_realtime ADD TABLE "messages";

