-- Random Critical Attack Logic
ALTER TABLE public.raids ADD COLUMN IF NOT EXISTS daily_crit_count INTEGER DEFAULT 0;
ALTER TABLE public.raids ADD COLUMN IF NOT EXISTS last_crit_reset_date TEXT;
ALTER TABLE public.raids DROP COLUMN IF EXISTS charge_meter;
ALTER TABLE public.raids DROP COLUMN IF EXISTS charge_deadline;
ALTER TABLE public.raids DROP COLUMN IF EXISTS last_charge_update;
