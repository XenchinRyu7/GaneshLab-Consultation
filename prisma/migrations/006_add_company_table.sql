-- Migration: Add Company table and update Project to use company relation
-- Created: 2024-01-XX

-- Create companies table
CREATE TABLE IF NOT EXISTS "companies" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "website" TEXT,
  "description" TEXT,
  "industry" TEXT,
  "address" TEXT,
  "city" TEXT,
  "province" TEXT,
  "postal_code" TEXT,
  "country" TEXT DEFAULT 'Indonesia',
  "phone" TEXT,
  "email" TEXT,
  "tax_id" TEXT,
  "logo" TEXT,
  "contact_person" TEXT,
  "contact_phone" TEXT,
  "contact_email" TEXT,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- Create unique index on user_id (one company per user)
CREATE UNIQUE INDEX IF NOT EXISTS "companies_user_id_key" ON "companies"("user_id");

-- Create indexes
CREATE INDEX IF NOT EXISTS "companies_user_id_idx" ON "companies"("user_id");
CREATE INDEX IF NOT EXISTS "companies_is_verified_idx" ON "companies"("is_verified");

-- Add foreign key constraint
ALTER TABLE "companies" 
  ADD CONSTRAINT "companies_user_id_fkey" 
  FOREIGN KEY ("user_id") 
  REFERENCES "user_profiles"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- Add company_id column to projects table
ALTER TABLE "projects" 
  ADD COLUMN IF NOT EXISTS "company_id" TEXT;

-- Create index on company_id
CREATE INDEX IF NOT EXISTS "projects_company_id_idx" ON "projects"("company_id");

-- Add foreign key constraint
ALTER TABLE "projects" 
  ADD CONSTRAINT "projects_company_id_fkey" 
  FOREIGN KEY ("company_id") 
  REFERENCES "companies"("id") 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Remove company-related columns from projects table
ALTER TABLE "projects" 
  DROP COLUMN IF EXISTS "company_name",
  DROP COLUMN IF EXISTS "company_website",
  DROP COLUMN IF EXISTS "contact_person",
  DROP COLUMN IF EXISTS "contact_phone",
  DROP COLUMN IF EXISTS "contact_email";

