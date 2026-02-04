UPDATE public.tasks SET status = 'pending' WHERE status = 'completed' AND completed_at IS NULL;
