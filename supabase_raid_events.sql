-- Raid Events Logic Update
ALTER TABLE public.raids ADD COLUMN IF NOT EXISTS last_daily_event_at TIMESTAMPTZ;
