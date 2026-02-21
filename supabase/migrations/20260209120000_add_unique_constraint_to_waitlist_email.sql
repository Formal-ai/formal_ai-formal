-- Add unique constraint to email column in waitlist table
-- This prevents duplicate entries for the same email address

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'waitlist_email_key' 
    ) THEN
        ALTER TABLE public.waitlist ADD CONSTRAINT waitlist_email_key UNIQUE (email);
    END IF;
END $$;
