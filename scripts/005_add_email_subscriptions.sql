-- Create email_subscriptions table for non-authenticated users
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  project_name TEXT,
  project_stage TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_active ON email_subscriptions(is_active);

-- Enable RLS
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
CREATE POLICY "Anyone can subscribe"
  ON email_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to view their own subscription
CREATE POLICY "Users can view own subscription"
  ON email_subscriptions
  FOR SELECT
  TO anon, authenticated
  USING (true);
