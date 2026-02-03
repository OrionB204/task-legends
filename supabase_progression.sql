-- ============================================
-- PROGRESSION & LOGS SYSTEM
-- ============================================

-- 1. Create Progression Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS progression_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, 
    -- 'XP_GAIN', 'LEVEL_UP', 'DAMAGE_TAKEN', 'GOLD_GAIN', 'GOLD_SPENT', 'MANA_GAIN', 'MANA_SPENT'
    
    amount NUMERIC NOT NULL DEFAULT 0,
    previous_value NUMERIC, -- Snapshot of the value before change
    new_value NUMERIC,      -- Snapshot of the value after change
    
    details TEXT,           -- Optional description (e.g. "Task completed: Fix Bug")
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on Logs
ALTER TABLE progression_logs ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can view their own logs
CREATE POLICY "Users can view own logs" ON progression_logs
FOR SELECT USING (auth.uid() = user_id);

-- 4. Trigger Function to Automatically Log Changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log XP Gain
    IF NEW.current_xp > OLD.current_xp THEN
        INSERT INTO progression_logs (user_id, event_type, amount, previous_value, new_value, details)
        VALUES (NEW.user_id, 'XP_GAIN', NEW.current_xp - OLD.current_xp, OLD.current_xp, NEW.current_xp, 'XP gained via action');
    END IF;

    -- Log Level Up
    IF NEW.level > OLD.level THEN
        INSERT INTO progression_logs (user_id, event_type, amount, previous_value, new_value, details)
        VALUES (NEW.user_id, 'LEVEL_UP', NEW.level - OLD.level, OLD.level, NEW.level, 'Level Up!');
    END IF;

    -- Log Damage Taken (HP Loss)
    IF NEW.current_hp < OLD.current_hp THEN
        INSERT INTO progression_logs (user_id, event_type, amount, previous_value, new_value, details)
        VALUES (NEW.user_id, 'DAMAGE_TAKEN', OLD.current_hp - NEW.current_hp, OLD.current_hp, NEW.current_hp, 'Damage taken');
    END IF;

    -- Log HP Recovered
    IF NEW.current_hp > OLD.current_hp THEN
        INSERT INTO progression_logs (user_id, event_type, amount, previous_value, new_value, details)
        VALUES (NEW.user_id, 'HEAL', NEW.current_hp - OLD.current_hp, OLD.current_hp, NEW.current_hp, 'HP Recovered');
    END IF;

    -- Log Gold Changes
    IF NEW.gold > OLD.gold THEN
        INSERT INTO progression_logs (user_id, event_type, amount, previous_value, new_value, details)
        VALUES (NEW.user_id, 'GOLD_GAIN', NEW.gold - OLD.gold, OLD.gold, NEW.gold, 'Gold earned');
    ELSIF NEW.gold < OLD.gold THEN
        INSERT INTO progression_logs (user_id, event_type, amount, previous_value, new_value, details)
        VALUES (NEW.user_id, 'GOLD_SPENT', OLD.gold - NEW.gold, OLD.gold, NEW.gold, 'Gold spent');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach Trigger to Profiles Table
DROP TRIGGER IF EXISTS trigger_log_profile_changes ON profiles;
CREATE TRIGGER trigger_log_profile_changes
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION log_profile_changes();

-- 6. Atomic Update Functions (RPCs) to prevent race conditions
-- Add Gold Safely
CREATE OR REPLACE FUNCTION add_gold(amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET gold = gold + amount
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add XP Safely (Complex leveling logic is complicated in SQL, so we might keep the basic increment here)
-- Note: Leveling logic is tricky to port 1:1 with TypeScript formulas without duplication. 
-- For now, we trust the client's calculation for leveling, BUT we log it via trigger.
-- If strict anti-cheat is needed, we would port `xpForLevel` to SQL.

-- 7. Grant Permissions (if needed, usually not required for authenticated users on public schema functions if RLS is set, but good practice)
GRANT ALL ON TABLE progression_logs TO authenticated;
GRANT EXECUTE ON FUNCTION add_gold TO authenticated;
