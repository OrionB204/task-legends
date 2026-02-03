-- ==============================================================================
-- STRIPE & DIAMONDS SETUP
-- Run this script in the Supabase SQL Editor to ensure the payment system works.
-- ==============================================================================

-- 1. Create table for transactions if not exists
CREATE TABLE IF NOT EXISTS diamond_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- 'purchase', 'usage', 'admin'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    balance_after INTEGER DEFAULT 0,
    reference_id TEXT,
    reference_type TEXT,
    metadata JSONB
);

-- 2. Enable RLS
ALTER TABLE diamond_transactions ENABLE ROW LEVEL SECURITY;

-- 3. Policy for users to view their own transactions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions'
    ) THEN
        CREATE POLICY "Users can view own transactions" ON diamond_transactions
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 4. Secure Function to Add Diamonds (Called by Stripe Webhook)
CREATE OR REPLACE FUNCTION add_diamonds(user_id UUID, amount_to_add INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE profiles
    SET diamonds = COALESCE(diamonds, 0) + amount_to_add
    WHERE user_id = add_diamonds.user_id;
END;
$$;

-- 5. Trigger to automatically set 'balance_after' in transaction history
CREATE OR REPLACE FUNCTION update_diamond_balance_after()
RETURNS TRIGGER AS $$
DECLARE
    current_diamonds INTEGER;
BEGIN
    -- Get current diamonds from profile (which was just updated by add_diamonds)
    SELECT diamonds INTO current_diamonds FROM profiles WHERE user_id = NEW.user_id;
    
    -- Set the balance_after field
    NEW.balance_after := COALESCE(current_diamonds, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_diamond_transaction ON diamond_transactions;

CREATE TRIGGER tr_update_diamond_transaction
BEFORE INSERT ON diamond_transactions
FOR EACH ROW
EXECUTE FUNCTION update_diamond_balance_after();

-- 6. Grant permissions (just in case)
GRANT SELECT, INSERT ON diamond_transactions TO service_role;
GRANT SELECT ON diamond_transactions TO authenticated;
