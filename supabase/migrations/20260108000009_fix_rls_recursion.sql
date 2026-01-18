-- FIX RLS INFINITE RECURSION
-- Issue: The previous policy on 'profiles' tried to SELECT from 'profiles' to check permissions, causing an infinite loop (500 Error).
-- Solution: Use a SECURITY DEFINER function to check admin status. Access inside this function bypasses RLS.

-- 1. Create a secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- <--- This is the key. It runs as superuser, bypassing RLS.
SET search_path = public -- Best practice for security definers
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can do everything on courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can do everything on sessions" ON public.live_sessions;

-- 3. Re-create policies using the safe function

-- Profiles: Admins can do everything
CREATE POLICY "Admins can do everything on profiles" 
ON public.profiles
FOR ALL 
USING ( public.is_admin() );

-- User Roles: Admins can do everything
CREATE POLICY "Admins can do everything on user_roles" 
ON public.user_roles
FOR ALL 
USING ( public.is_admin() );

-- Courses: Admins can do everything
CREATE POLICY "Admins can do everything on courses" 
ON public.courses
FOR ALL 
USING ( public.is_admin() );

-- Live Sessions: Admins can do everything
CREATE POLICY "Admins can do everything on sessions" 
ON public.live_sessions
FOR ALL 
USING ( public.is_admin() );
