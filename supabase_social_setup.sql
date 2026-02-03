-- ============================================
-- SOCIAL FEATURES SETUP SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- 0. Enable extensions for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Create Friends Table
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate friendships
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  -- Prevent self-friendship
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- 2. Create Online Status Table
CREATE TABLE IF NOT EXISTS online_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_status ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Friends
-- View: Users can view their own friendships and requests
CREATE POLICY "Users can view own friends" ON friends
FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);

-- Insert: Users can send friend requests (user_id must be themselves)
CREATE POLICY "Users can send friend requests" ON friends
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Update: Users can accept/reject requests (friend_id must be themselves)
-- Or cancel their own requests (user_id must be themselves)
CREATE POLICY "Users can update own friendships" ON friends
FOR UPDATE USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);

-- Delete: Users can remove friends or cancel requests
CREATE POLICY "Users can delete own friendships" ON friends
FOR DELETE USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);

-- 5. Policies for Online Status
-- View: Everyone can see online status (or restrict to friends if preferred, but public is easier for now)
CREATE POLICY "Everyone can view online status" ON online_status
FOR SELECT USING (true);

-- Update: Users can only update their own status
CREATE POLICY "Users update own status" ON online_status
FOR ALL USING (
  auth.uid() = user_id
);

-- 6. Enable Realtime
-- NOTE: If you get an error saying "publication supabase_realtime is defined as FOR ALL TABLES", 
-- simply skip these two lines as realtime is already enabled globally.
-- ALTER PUBLICATION supabase_realtime ADD TABLE friends;
-- ALTER PUBLICATION supabase_realtime ADD TABLE online_status;

-- 7. Secure Search Function (Allows searching by partial email or username)
-- This function runs with security definer to access auth.users safely
CREATE OR REPLACE FUNCTION search_profiles(search_query TEXT)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  similarity_score REAL
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    GREATEST(
      similarity(p.username, search_query),
      CASE WHEN u.email ILIKE '%' || search_query || '%' THEN 1.0 ELSE 0.0 END
    )::REAL as similarity_score
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE 
    p.username ILIKE '%' || search_query || '%' 
    OR u.email ILIKE '%' || search_query || '%'
  ORDER BY similarity_score DESC
  LIMIT 20;
END;
$$;

-- Note: 'similarity' function might require pg_trgm extension. 
-- If it fails, enable it: CREATE EXTENSION IF NOT EXISTS pg_trgm;
