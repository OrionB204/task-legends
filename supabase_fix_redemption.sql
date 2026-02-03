-- ==============================================================================
-- FIX REDEMPTION SYSTEM
-- Run this entire script in your Supabase SQL Editor to reset and fix the system.
-- ==============================================================================

-- 1. Clean up old/conflicting functions and tables
DROP FUNCTION IF EXISTS redeem_diamond_code(text);
DROP TABLE IF EXISTS redemption_history CASCADE;
DROP TABLE IF EXISTS redemption_codes CASCADE;

-- 2. Create the correct Tables
CREATE TABLE redemption_codes (
    code TEXT PRIMARY KEY,
    diamonds_reward INTEGER NOT NULL CHECK (diamonds_reward > 0),
    max_uses INTEGER DEFAULT 1, -- Set to -1 for infinite uses (global codes)
    current_uses INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE redemption_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT REFERENCES redemption_codes(code) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_redemption_per_user UNIQUE (user_id, code)
);

-- 3. Enable Security (RLS)
ALTER TABLE redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to try to redeem (logic is in the function)
CREATE POLICY "System can read codes" ON redemption_codes FOR SELECT USING (true);
CREATE POLICY "Users view own history" ON redemption_history FOR SELECT USING (auth.uid() = user_id);

-- 4. Create the Redemption Function
CREATE OR REPLACE FUNCTION redeem_diamond_code(input_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    target_code RECORD;
    already_redeemed BOOLEAN;
BEGIN
    -- Find the code
    SELECT * INTO target_code 
    FROM redemption_codes 
    WHERE code = input_code;

    -- Check if exists
    IF target_code IS NULL OR target_code.active = false THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou inexistente.');
    END IF;

    -- Check Usage Limits
    IF target_code.max_uses != -1 AND target_code.current_uses >= target_code.max_uses THEN
        RETURN jsonb_build_object('success', false, 'message', 'Este código já esgotou seu limite de uso.');
    END IF;

    -- Check if User already redeemed
    IF EXISTS (SELECT 1 FROM redemption_history WHERE user_id = auth.uid() AND code = input_code) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Você já resgatou este código!');
    END IF;

    -- EXECUTE REDEMPTION
    
    -- 1. Log history
    INSERT INTO redemption_history (user_id, code) VALUES (auth.uid(), input_code);
    
    -- 2. Increment usage
    UPDATE redemption_codes SET current_uses = current_uses + 1 WHERE code = input_code;
    
    -- 3. AWARD DIAMONDS
    UPDATE profiles 
    SET diamonds = diamonds + target_code.diamonds_reward 
    WHERE user_id = auth.uid();

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Resgate com sucesso! +' || target_code.diamonds_reward || ' Diamantes adicionados!'
    );
END;
$$;

-- 5. INSERT NEW CODES (Including 5 Diamond Codes as requested)
INSERT INTO redemption_codes (code, diamonds_reward, max_uses) VALUES
('BEMVINDO2026', 10, -1),      -- Global Code: 10 Diamonds
('TASKQUEST5', 5, -1),         -- Global Code: 5 Diamonds
('DIAMANTE5', 5, -1),          -- Global Code: 5 Diamonds
('VAMOSPRACIMA', 20, -1),      -- Global Code: 20 Diamonds
('D5-ALPHA', 5, 1),            -- Unique Code (1 use)
('D5-BETA', 5, 1),
('D5-GAMMA', 5, 1),
('D5-DELTA', 5, 1),
('D5-OMEGA', 5, 1)
ON CONFLICT (code) DO NOTHING;
