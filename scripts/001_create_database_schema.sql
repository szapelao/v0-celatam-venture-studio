-- CeLatam Venture Studio Database Schema
-- This script creates the core tables for the matching app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  company_stage TEXT CHECK (company_stage IN ('idea', 'mvp', 'early_stage', 'growth', 'scale')),
  industry TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create needs table for what founders are looking for
CREATE TABLE IF NOT EXISTS public.needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('funding', 'mentorship', 'talent', 'partnerships', 'resources', 'customers', 'advisors')),
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  budget_range TEXT,
  timeline TEXT,
  skills_needed TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create opportunities table for what's available
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('funding', 'mentorship', 'talent', 'partnerships', 'resources', 'customers', 'advisors')),
  type TEXT NOT NULL CHECK (type IN ('service', 'investment', 'partnership', 'job', 'resource', 'event')),
  requirements TEXT,
  benefits TEXT,
  contact_info JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table for tracking connections
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id UUID NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(need_id, opportunity_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('match', 'message', 'opportunity', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID, -- Can reference matches, opportunities, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for needs
CREATE POLICY "Users can view all needs" ON public.needs FOR SELECT USING (true);
CREATE POLICY "Users can insert their own needs" ON public.needs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own needs" ON public.needs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own needs" ON public.needs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for opportunities
CREATE POLICY "Users can view all opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Users can insert their own opportunities" ON public.opportunities FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Users can update their own opportunities" ON public.opportunities FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Users can delete their own opportunities" ON public.opportunities FOR DELETE USING (auth.uid() = provider_id);

-- RLS Policies for matches
CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = provider_id);
CREATE POLICY "Users can create matches for their needs" ON public.matches FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update matches they're involved in" ON public.matches FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = provider_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_stage ON public.profiles(company_stage);
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON public.profiles(industry);
CREATE INDEX IF NOT EXISTS idx_needs_category ON public.needs(category);
CREATE INDEX IF NOT EXISTS idx_needs_user_id ON public.needs(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_provider_id ON public.opportunities(provider_id);
CREATE INDEX IF NOT EXISTS idx_matches_need_id ON public.matches(need_id);
CREATE INDEX IF NOT EXISTS idx_matches_opportunity_id ON public.matches(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_needs_updated_at BEFORE UPDATE ON public.needs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
