-- Support Tickets Table Setup
-- Run this in Supabase SQL Editor

-- Create the support_tickets table if not exists
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('complaint', 'bug', 'user_report', 'redemption_issue')),
  transaction_id TEXT,
  reported_user_id UUID REFERENCES auth.users(id),
  duel_id UUID,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can read their own tickets
DROP POLICY IF EXISTS "Users can read own tickets" ON public.support_tickets;
CREATE POLICY "Users can read own tickets" ON public.support_tickets
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can create tickets
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON public.support_tickets(created_at DESC);

-- Grant permissions
GRANT ALL ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;

SELECT 'Support tickets table created successfully!' as result;
