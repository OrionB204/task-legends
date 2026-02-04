UPDATE public.raids SET charge_meter = 50, last_charge_update = NOW() - INTERVAL '1 minute' WHERE status = 'active';
