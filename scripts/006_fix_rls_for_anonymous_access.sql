-- Fix RLS policies to allow anonymous access for the no-login flow
-- This allows users to view opportunities and profiles without authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all opportunities" ON public.opportunities;

-- Create new policies that allow anonymous SELECT access
-- Allow anyone (including anonymous users) to view profiles
CREATE POLICY "Anyone can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Allow anyone (including anonymous users) to view active opportunities
CREATE POLICY "Anyone can view opportunities" 
  ON public.opportunities 
  FOR SELECT 
  USING (is_active = true);

-- Keep authenticated user policies for INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can delete their own profile" 
  ON public.profiles 
  FOR DELETE 
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert opportunities" 
  ON public.opportunities 
  FOR INSERT 
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Authenticated users can update their opportunities" 
  ON public.opportunities 
  FOR UPDATE 
  USING (auth.uid() = provider_id);

CREATE POLICY "Authenticated users can delete their opportunities" 
  ON public.opportunities 
  FOR DELETE 
  USING (auth.uid() = provider_id);
