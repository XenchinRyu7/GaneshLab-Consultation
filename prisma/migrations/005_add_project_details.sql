-- Migration: Add detailed project fields
-- Created: 2024-01-XX

-- Create enums
CREATE TYPE "ProjectType" AS ENUM (
  'WEB_APPLICATION',
  'MOBILE_APPLICATION',
  'IOT',
  'WEB_BANKING',
  'E_COMMERCE',
  'ENTERPRISE_SOFTWARE',
  'CUSTOM_SOFTWARE',
  'CONSULTATION',
  'MAINTENANCE',
  'OTHER'
);

CREATE TYPE "ProjectComplexity" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'VERY_HIGH'
);

CREATE TYPE "ProjectPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

-- Add new columns to projects table
ALTER TABLE "projects" 
  ADD COLUMN IF NOT EXISTS "type" "ProjectType" NOT NULL DEFAULT 'OTHER',
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "budget_min" DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS "budget_max" DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS "estimated_cost" DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS "complexity" "ProjectComplexity" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS "timeline" INTEGER,
  ADD COLUMN IF NOT EXISTS "start_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "end_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "technology_stack" TEXT,
  ADD COLUMN IF NOT EXISTS "requirements" TEXT,
  ADD COLUMN IF NOT EXISTS "features" TEXT,
  ADD COLUMN IF NOT EXISTS "deliverables" TEXT,
  ADD COLUMN IF NOT EXISTS "company_name" TEXT,
  ADD COLUMN IF NOT EXISTS "company_website" TEXT,
  ADD COLUMN IF NOT EXISTS "contact_person" TEXT,
  ADD COLUMN IF NOT EXISTS "contact_phone" TEXT,
  ADD COLUMN IF NOT EXISTS "contact_email" TEXT,
  ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "client_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Update status column to support more statuses
-- Note: This assumes status is currently VARCHAR/TEXT
-- If you want to make it an enum, you'd need to create a Status enum first

-- Create indexes
CREATE INDEX IF NOT EXISTS "projects_type_idx" ON "projects"("type");
CREATE INDEX IF NOT EXISTS "projects_complexity_idx" ON "projects"("complexity");
CREATE INDEX IF NOT EXISTS "projects_priority_idx" ON "projects"("priority");
CREATE INDEX IF NOT EXISTS "projects_created_at_idx" ON "projects"("created_at");
CREATE INDEX IF NOT EXISTS "projects_deleted_at_idx" ON "projects"("deleted_at");

-- Add check constraint for progress (0-100)
ALTER TABLE "projects" 
  ADD CONSTRAINT "projects_progress_check" 
  CHECK ("progress" >= 0 AND "progress" <= 100);

-- Add check constraint for budget range
ALTER TABLE "projects" 
  ADD CONSTRAINT "projects_budget_check" 
  CHECK ("budget_min" IS NULL OR "budget_max" IS NULL OR "budget_min" <= "budget_max");

