-- Add feedback system tables to support user feedback and platform improvement

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('platform', 'match', 'opportunity', 'general')),
  category TEXT, -- For platform feedback: matching, ui_ux, features, performance, bugs, suggestions, other
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  is_resolved BOOLEAN DEFAULT FALSE,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback_analytics table for tracking feedback trends
CREATE TABLE IF NOT EXISTS public.feedback_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_feedback INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  category_breakdown JSONB,
  sentiment_score DECIMAL(3,2), -- For future sentiment analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON public.feedback FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for feedback_analytics (admin only for now)
CREATE POLICY "Admins can view feedback analytics" ON public.feedback_analytics FOR SELECT USING (true); -- You might want to restrict this to admin users

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_match_id ON public.feedback(match_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at);

-- Add updated_at trigger for feedback
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate feedback analytics
CREATE OR REPLACE FUNCTION calculate_feedback_analytics(start_date DATE, end_date DATE)
RETURNS TABLE (
  total_feedback INTEGER,
  average_rating DECIMAL(3,2),
  category_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_feedback,
    ROUND(AVG(rating), 2)::DECIMAL(3,2) as average_rating,
    jsonb_object_agg(
      COALESCE(category, 'uncategorized'), 
      category_count
    ) as category_breakdown
  FROM (
    SELECT 
      category,
      COUNT(*) as category_count
    FROM public.feedback 
    WHERE created_at::DATE BETWEEN start_date AND end_date
    GROUP BY category
  ) category_stats;
END;
$$ LANGUAGE plpgsql;

-- Create notification trigger for new feedback (optional)
CREATE OR REPLACE FUNCTION notify_new_feedback()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for admins about new feedback
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    message, 
    related_id
  )
  SELECT 
    p.id,
    'feedback',
    'New Feedback Received',
    'A user has submitted new feedback: ' || LEFT(NEW.message, 100) || '...',
    NEW.id
  FROM public.profiles p 
  WHERE p.id = NEW.user_id; -- You might want to change this to notify admins instead
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new feedback notifications
CREATE TRIGGER trigger_notify_new_feedback
  AFTER INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_feedback();
