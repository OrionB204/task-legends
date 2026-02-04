-- Supernova Logic Update
ALTER TABLE public.raids ADD COLUMN IF NOT EXISTS last_charge_update TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.raid_members ADD COLUMN IF NOT EXISTS daily_task_count INTEGER DEFAULT 0;
ALTER TABLE public.raid_members ADD COLUMN IF NOT EXISTS last_task_reset TIMESTAMPTZ DEFAULT NOW();
