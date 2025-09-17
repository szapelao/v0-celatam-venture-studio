-- Create a default admin user (you can update this with your actual admin email)
-- This will only work if the user already exists in auth.users
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@celatam.com' 
AND EXISTS (
  SELECT 1 FROM auth.users 
  WHERE auth.users.email = profiles.email
);

-- Insert some sample opportunities for testing
INSERT INTO opportunities (title, description, category, type, requirements, benefits, provider_id, source_url, deadline, created_by, is_active)
SELECT 
  'Celo Foundation Grant Program',
  'Funding opportunities for projects building on Celo blockchain with focus on financial inclusion and sustainability.',
  'Funding',
  'Grant',
  'Working prototype, clear roadmap, alignment with Celo mission',
  'Up to $50K funding, technical support, marketing assistance',
  id,
  'https://celo.org/grants',
  NOW() + INTERVAL '3 months',
  id,
  true
FROM profiles 
WHERE role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO opportunities (title, description, category, type, requirements, benefits, provider_id, source_url, deadline, created_by, is_active)
SELECT 
  'Web3 Accelerator Program',
  'Mentorship and acceleration program for early-stage Web3 startups in Latin America.',
  'Mentorship',
  'Program',
  'Early-stage startup, Latin American team, Web3 focus',
  'Mentorship, network access, demo day presentation',
  id,
  'https://web3accelerator.com',
  NOW() + INTERVAL '2 months',
  id,
  true
FROM profiles 
WHERE role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;
