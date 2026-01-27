-- AI Analyst Storage
CREATE TABLE IF NOT EXISTS public.ai_analyst_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    dashboard_type TEXT DEFAULT 'recurrence', -- 'recurrence', 'volumetria', etc.
    analysis_text TEXT NOT NULL,
    priority_level TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
    metadata JSONB DEFAULT '{}'::jsonb -- Stores raw stats used for generation
);

-- RLS
ALTER TABLE public.ai_analyst_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read ai logs" 
ON public.ai_analyst_logs FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow backend insert ai logs" 
ON public.ai_analyst_logs FOR INSERT 
TO public 
WITH CHECK (true); -- Ideally restrict to service role, simplified for now
