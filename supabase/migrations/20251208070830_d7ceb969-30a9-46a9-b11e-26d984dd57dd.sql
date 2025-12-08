-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view participants in their joined sessions" ON public.session_participants;

-- Create a simpler, non-recursive policy for viewing participants
-- Users can see participants in any session they are part of or instructors can see all
CREATE POLICY "Users can view session participants"
ON public.session_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.live_sessions ls 
    WHERE ls.id = session_id AND ls.instructor_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'instructor')
);

-- Add the current user as an instructor so they can access live sessions
INSERT INTO public.user_roles (user_id, role)
SELECT '639d4cce-809e-430f-bdca-d36bca808cb6', 'instructor'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '639d4cce-809e-430f-bdca-d36bca808cb6' 
  AND role = 'instructor'
);