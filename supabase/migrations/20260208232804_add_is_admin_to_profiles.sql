-- Add is_admin column to profiles table for proper admin verification
-- This replaces the insecure localStorage-based admin check

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add an index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

COMMENT ON COLUMN public.profiles.is_admin IS 'Server-verified admin status. Never trust client-side admin checks.';
