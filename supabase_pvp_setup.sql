-- ============================================
-- PVP ARENA SETUP SCRIPT
-- Run this in Supabase SQL Editor to fix the "Loading" issue
-- ============================================

-- 1. Create pvp_duels Table
CREATE TABLE IF NOT EXISTS pvp_duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth.users(id),
  challenged_id UUID NOT NULL REFERENCES auth.users(id),
  challenger_hp INTEGER DEFAULT 100,
  challenged_hp INTEGER DEFAULT 100,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'selecting', 'active', 'completed', 'cancelled')),
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- 2. Create pvp_selected_tasks Table
CREATE TABLE IF NOT EXISTS pvp_selected_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID NOT NULL REFERENCES pvp_duels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  task_id UUID NOT NULL REFERENCES tasks(id),
  locked BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  evidence_url TEXT,
  contested BOOLEAN DEFAULT false,
  contest_reason TEXT,
  damage_dealt INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Storage Bucket for Evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task_evidences', 'task_evidences', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE pvp_duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_selected_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Policies for pvp_duels
CREATE POLICY "Users can view their own duels" ON pvp_duels
FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create duels" ON pvp_duels
FOR INSERT WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update their own duels" ON pvp_duels
FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- 6. Policies for pvp_selected_tasks
CREATE POLICY "Users can view their duel tasks" ON pvp_selected_tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM pvp_duels 
    WHERE pvp_duels.id = duel_id 
    AND (pvp_duels.challenger_id = auth.uid() OR pvp_duels.challenged_id = auth.uid())
  )
);

CREATE POLICY "Users can create their duel tasks" ON pvp_selected_tasks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their duel tasks" ON pvp_selected_tasks
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their duel tasks" ON pvp_selected_tasks
FOR DELETE USING (auth.uid() = user_id AND locked = false);

-- 7. Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'task_evidences');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'task_evidences' AND auth.role() = 'authenticated');

-- 8. Enable Realtime triggers locally (no 'publication')
-- No actions needed here as Realtime is usually global.
