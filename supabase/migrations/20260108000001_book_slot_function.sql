-- Function to handle slot booking safely
CREATE OR REPLACE FUNCTION public.book_course_slot(
    p_course_id UUID,
    p_user_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_instructor_id UUID DEFAULT NULL -- Optional, falling back to course owner if null
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session_id UUID;
    v_instructor_id UUID;
    v_course_title TEXT;
BEGIN
    -- 1. Get Course Details if not provided
    IF p_instructor_id IS NULL THEN
        SELECT instructor_id, title INTO v_instructor_id, v_course_title
        FROM public.courses
        WHERE id = p_course_id;
        
        -- Fallback if instructor_id is null in courses (legacy data)
        IF v_instructor_id IS NULL THEN
             -- Determine what to do. For now, maybe query profiles or just fail/warn.
             -- Let's try to find an admin or just use the first instructor found? No, that's unsafe.
             -- Let's assume the course CREATOR is the instructor if not set, or fail.
             -- For now, let's just raise an error if we can't find an instructor.
             RAISE EXCEPTION 'Course instructor not found';
        END IF;
    ELSE
        v_instructor_id := p_instructor_id;
        SELECT title INTO v_course_title FROM public.courses WHERE id = p_course_id;
    END IF;

    -- 2. Check/Create Live Session
    SELECT id INTO v_session_id
    FROM public.live_sessions
    WHERE course_id = p_course_id AND scheduled_start = p_start_time;

    IF v_session_id IS NULL THEN
        INSERT INTO public.live_sessions (
            course_id,
            instructor_id,
            title,
            scheduled_start,
            scheduled_end,
            status,
            chat_enabled
        ) VALUES (
            p_course_id,
            v_instructor_id,
            coalesce(v_course_title, 'Course Session') || ' - Live Session',
            p_start_time,
            p_end_time,
            'scheduled',
            true
        ) RETURNING id INTO v_session_id;
    END IF;

    -- 3. Add Participant
    INSERT INTO public.session_participants (
        session_id,
        user_id,
        status
    ) VALUES (
        v_session_id,
        p_user_id,
        'active'
    ) ON CONFLICT (session_id, user_id) DO NOTHING;

    -- 4. Enroll in Course (if not already)
    INSERT INTO public.enrollments (
        user_id,
        course_id,
        status
    ) VALUES (
        p_user_id,
        p_course_id,
        'active'
    ) ON CONFLICT (user_id, course_id) DO NOTHING;

    RETURN jsonb_build_object('success', true, 'session_id', v_session_id);
END;
$$;
