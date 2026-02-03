-- ============================================
-- DIRECT MESSAGES SETUP SCRIPT
-- ============================================

-- 1. Create Direct Messages Table
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent users from sending messages to themselves
  CONSTRAINT no_self_messaging CHECK (sender_id != receiver_id)
);

-- 2. Enable RLS
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- 3. Policies for Direct Messages
-- View: Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages" ON direct_messages
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Insert: Users can only send messages as themselves
CREATE POLICY "Users can send messages" ON direct_messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

-- Update: Users can mark messages as read (if they are the receiver)
CREATE POLICY "Users can update received messages" ON direct_messages
FOR UPDATE USING (
  auth.uid() = receiver_id
);

-- 4. Enable Realtime (Optional, usually globally enabled, but if you need to be specific)
-- Note: Re-run this only if you want to ensure it's in the publication.
-- If getting "publication is defined as FOR ALL TABLES", ignore this part.
-- ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;

-- 5. Index for faster queries
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_receiver 
ON direct_messages(sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_read 
ON direct_messages(receiver_id, read);
