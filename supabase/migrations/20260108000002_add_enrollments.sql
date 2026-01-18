-- Create enrollments table
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    UNIQUE(user_id, course_id)
);

-- RLS Policies
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments"
    ON public.enrollments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments"
    ON public.enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);
