-- Function to Enroll in a Course (without session booking)
CREATE OR REPLACE FUNCTION public.enroll_course(
    p_course_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.enrollments (
        user_id,
        course_id,
        status
    ) VALUES (
        p_user_id,
        p_course_id,
        'active'
    ) ON CONFLICT (user_id, course_id) DO NOTHING;

    RETURN jsonb_build_object('success', true);
END;
$$;
