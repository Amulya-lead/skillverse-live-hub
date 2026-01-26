-- Create live_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_url TEXT,
    max_participants INTEGER DEFAULT 50,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create session_participants table
CREATE TABLE IF NOT EXISTS public.session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'missed')),
    joined_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(session_id, user_id)
);

-- Enable RLS
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Policies for live_sessions
-- Everyone can view scheduled sessions for published courses (or if enrolled - simpler for now: public read if course is public)
DROP POLICY IF EXISTS "Public view live sessions" ON public.live_sessions;
CREATE POLICY "Public view live sessions" ON public.live_sessions
    FOR SELECT USING (true); -- Refine later to course enrollment if needed

-- Instructors can manage their own sessions
DROP POLICY IF EXISTS "Instructors manage own sessions" ON public.live_sessions;
CREATE POLICY "Instructors manage own sessions" ON public.live_sessions
    FOR ALL USING (auth.uid() = instructor_id);

-- Policies for session_participants
-- Users can view their own participation
DROP POLICY IF EXISTS "Users view own participation" ON public.session_participants;
CREATE POLICY "Users view own participation" ON public.session_participants
    FOR SELECT USING (auth.uid() = user_id);

-- System/Instructors can manage participants (via functions or direct)
-- For now, let's allow instructors to view participants of their sessions
DROP POLICY IF EXISTS "Instructors view participants" ON public.session_participants;
CREATE POLICY "Instructors view participants" ON public.session_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.live_sessions 
            WHERE id = session_participants.session_id 
            AND instructor_id = auth.uid()
        )
    );
