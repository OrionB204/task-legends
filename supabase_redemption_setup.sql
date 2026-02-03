-- ============================================
-- DIAMOND REDEMPTION SYSTEM
-- ============================================

-- 1. Create Redemption Codes Table
CREATE TABLE IF NOT EXISTS redemption_codes (
  code TEXT PRIMARY KEY,
  diamonds_reward INTEGER NOT NULL CHECK (diamonds_reward > 0),
  max_uses INTEGER DEFAULT 1, -- How many times this code can be used total (-1 for infinite)
  current_uses INTEGER DEFAULT 0,
  expiration_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Create Redemption History (to prevent double dipping)
CREATE TABLE IF NOT EXISTS redemption_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL REFERENCES redemption_codes(code),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_code UNIQUE (user_id, code)
);

-- 3. Enable RLS
ALTER TABLE redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_history ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Codes are hidden from public view, only accessed via secure function
CREATE POLICY "Admins can view codes" ON redemption_codes
FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_super_admin = true)); 
-- Note: 'is_super_admin' assumes you have such column, or just disable public access entirely.
-- A safer approach for this MVP: No public access policies for SELECT. Only allow function usage.

CREATE POLICY "Users view own history" ON redemption_history
FOR SELECT USING (auth.uid() = user_id);

-- 5. Secure Function to Redeem Code
CREATE OR REPLACE FUNCTION redeem_diamond_code(input_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_code RECORD;
  user_profile RECORD;
BEGIN
  -- 1. Find the code
  SELECT * INTO target_code 
  FROM redemption_codes 
  WHERE code = input_code 
  AND active = true;

  -- 2. Validate Code Existence
  IF target_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou expirado.');
  END IF;

  -- 3. Validate Expiration
  IF target_code.expiration_date IS NOT NULL AND target_code.expiration_date < NOW() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Este código expirou.');
  END IF;

  -- 4. Validate Max Uses
  IF target_code.max_uses != -1 AND target_code.current_uses >= target_code.max_uses THEN
    RETURN jsonb_build_object('success', false, 'message', 'Este código atingiu o limite de usos.');
  END IF;

  -- 5. Check if user already redeemed
  PERFORM 1 FROM redemption_history 
  WHERE user_id = auth.uid() AND code = input_code;
  
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Você já resgatou este código.');
  END IF;

  -- 6. Execute Redemption (Atomic Transaction)
  
  -- Update Code Usage
  UPDATE redemption_codes 
  SET current_uses = current_uses + 1 
  WHERE code = input_code;

  -- Insert History
  INSERT INTO redemption_history (user_id, code) 
  VALUES (auth.uid(), input_code);

  -- Give Diamonds
  UPDATE profiles 
  SET diamonds = diamonds + target_code.diamonds_reward 
  WHERE user_id = auth.uid();

  -- Log action (optional, leveraging our progression_logs if exists)
  -- INSERT INTO progression_logs...

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Código resgatado com sucesso! +' || target_code.diamonds_reward || ' Diamantes!',
    'diamonds_gained', target_code.diamonds_reward
  );
END;
$$;

-- 6. Insert some default codes for testing
INSERT INTO redemption_codes (code, diamonds_reward, max_uses)
VALUES 
  ('WELCOME2026', 50, -1),
  ('TASKMASTER', 100, -1),
  ('DIAMOND4FREE', 10, -1)
ON CONFLICT (code) DO NOTHING;
