-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('admin', 'pic', 'client');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL, -- Hashed password (bcrypt)
  "fullname" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'client',
  "avatar_color" TEXT, -- Hex color code (e.g., #3b82f6) for user avatar background
  "phone" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "user_profiles_email_idx" ON "user_profiles"("email");
CREATE INDEX IF NOT EXISTS "user_profiles_role_idx" ON "user_profiles"("role");
CREATE INDEX IF NOT EXISTS "user_profiles_user_id_idx" ON "user_profiles"("user_id");

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Note: RLS policies tidak diperlukan karena kita akan handle authorization di aplikasi
-- Jika ingin menggunakan RLS, bisa ditambahkan nanti setelah session management selesai

