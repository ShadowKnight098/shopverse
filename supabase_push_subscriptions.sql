-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflict
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON push_subscriptions;

-- Policy: Users can perform all actions on their own subscriptions
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON push_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
