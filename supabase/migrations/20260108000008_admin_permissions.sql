-- Enable RLS permissions for Admins on all key tables

-- 1. Profiles: Admins can do everything
CREATE POLICY "Admins can do everything on profiles" 
ON public.profiles
FOR ALL 
USING ( 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) 
);

-- 2. User Roles: Admins can do everything
CREATE POLICY "Admins can do everything on user_roles" 
ON public.user_roles
FOR ALL 
USING ( 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) 
);

-- 3. Courses: Admins can do everything
CREATE POLICY "Admins can do everything on courses" 
ON public.courses
FOR ALL 
USING ( 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) 
);

-- 4. Live Sessions: Admins can do everything
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on sessions" 
ON public.live_sessions
FOR ALL 
USING ( 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) 
);
