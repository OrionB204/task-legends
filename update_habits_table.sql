-- Add new columns to habits table to match Habitica features
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS is_negative boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Ensure is_positive exists (it should, but just in case)
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS is_positive boolean DEFAULT true;

-- Update existing rows to have sensible defaults
UPDATE public.habits SET is_negative = true WHERE is_negative IS NULL;
UPDATE public.habits SET difficulty = 'easy' WHERE difficulty IS NULL;
