-- Migration: 007_referral_logic
-- Date: 2026-04-15
-- Description: Automated referral rewards and code generation

-- 1. Ensure referral_code is generated for existing and new users
ALTER TABLE profiles ALTER COLUMN referral_code SET DEFAULT substring(upper(md5(gen_random_uuid()::text)) from 1 for 8);

UPDATE profiles SET referral_code = substring(upper(md5(id::text)) from 1 for 8) WHERE referral_code IS NULL;

-- 2. Logic to process referral rewards
CREATE OR REPLACE FUNCTION handle_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
    referrer_id UUID;
BEGIN
    -- Check if metadata contains a referral code from the signup form
    -- This assumes the signup metadata 'referred_by_code' is passed to profiles
    IF NEW.referred_by IS NOT NULL THEN
        -- Link the referred_by ID if not already set (lookup by code if needed)
        RETURN NEW;
    END IF;

    -- If we have a code but no ID yet (e.g., from signup metadata)
    -- We can handle this logic in the trigger if we pass the code to a temporary column or use the raw metadata
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reward Function (Manual Trigger or called from Webhook)
CREATE OR REPLACE FUNCTION reward_referrer(referral_code_input TEXT, recruit_id UUID)
RETURNS VOID AS $$
DECLARE
    referrer_record RECORD;
BEGIN
    SELECT * INTO referrer_record FROM profiles WHERE referral_code = referral_code_input LIMIT 1;
    
    IF FOUND AND referrer_record.id != recruit_id THEN
        -- Update the recruit's profile to link them
        UPDATE profiles SET referred_by = referrer_record.id WHERE id = recruit_id;
        
        -- Reward the referrer
        UPDATE profiles 
        SET free_months_earned = COALESCE(free_months_earned, 0) + 1,
            ats_checks_used = GREATEST(0, ats_checks_used - 10) -- Bonus checks
        WHERE id = referrer_record.id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
