
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  use_case TEXT,
  desired_features TEXT[],
  motivation TEXT,
  status TEXT DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can join the waitlist)
CREATE POLICY \
Allow
anonymous
inserts
to
waitlist\ ON waitlist
  FOR INSERT WITH CHECK (true);

