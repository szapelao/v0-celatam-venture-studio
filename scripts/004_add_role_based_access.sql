-- Add role-based access control to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'founder' CHECK (role IN ('founder', 'admin', 'provider'));

-- Add missing fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS karmagap_url TEXT;

-- Update RLS policies for admin access
DROP POLICY IF EXISTS "Admins can view all data" ON public.profiles;
CREATE POLICY "Admins can view all data" ON public.profiles FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Add admin policies for opportunities
DROP POLICY IF EXISTS "Admins can manage all opportunities" ON public.opportunities;
CREATE POLICY "Admins can manage all opportunities" ON public.opportunities FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Add admin policies for needs
DROP POLICY IF EXISTS "Admins can view all needs" ON public.needs;
CREATE POLICY "Admins can view all needs" ON public.needs FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Add admin policies for matches
DROP POLICY IF EXISTS "Admins can view all matches" ON public.matches;
CREATE POLICY "Admins can view all matches" ON public.matches FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
