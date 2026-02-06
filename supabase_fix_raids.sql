-- Fix Raids Table Structure
-- Run this in Supabase SQL Editor to ensure all required columns exist

-- Add missing columns if they don't exist
ALTER TABLE public.raids 
ADD COLUMN IF NOT EXISTS charge_meter FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS charge_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_stunned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stunned_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_daily_event_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS daily_crit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_crit_reset_date DATE;

-- Ensure charge_meter is the right type (FLOAT, not INTEGER)
ALTER TABLE public.raids 
ALTER COLUMN charge_meter TYPE FLOAT USING charge_meter::float;

-- Update existing active raids with defaults if null
UPDATE public.raids 
SET 
  charge_meter = COALESCE(charge_meter, 0),
  charge_deadline = COALESCE(charge_deadline, NOW() + INTERVAL '3 days')
WHERE status = 'active';

-- Grant permissions
ALTER TABLE public.raids ENABLE ROW LEVEL SECURITY;

-- Ensure authenticated users can read all raids
DROP POLICY IF EXISTS "Allow read raids" ON public.raids;
CREATE POLICY "Allow read raids" ON public.raids
FOR SELECT TO authenticated USING (true);

-- Ensure authenticated users can insert raids
DROP POLICY IF EXISTS "Allow create raids" ON public.raids;
CREATE POLICY "Allow create raids" ON public.raids
FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);

-- Ensure leaders can update their raids
DROP POLICY IF EXISTS "Allow update own raids" ON public.raids;
CREATE POLICY "Allow update own raids" ON public.raids
FOR UPDATE TO authenticated USING (auth.uid() = leader_id);

-- Allow service role to update any raid (for game mechanics)
DROP POLICY IF EXISTS "Allow service update raids" ON public.raids;
CREATE POLICY "Allow service update raids" ON public.raids
FOR UPDATE TO service_role USING (true);

SELECT 'Raids table fixed successfully!' as result;
