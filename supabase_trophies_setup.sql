-- Add trophies column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trophies INTEGER DEFAULT 0;

-- Ensure it's never null
UPDATE profiles SET trophies = 0 WHERE trophies IS NULL;
ALTER TABLE profiles ALTER COLUMN trophies SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN trophies SET NOT NULL;
