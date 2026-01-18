-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Clean up existing courses data (Mock Data Removal as requested)
TRUNCATE TABLE public.course_slots CASCADE;
TRUNCATE TABLE public.course_syllabus CASCADE;
TRUNCATE TABLE public.course_perks CASCADE;
TRUNCATE TABLE public.course_offerings CASCADE;
DELETE FROM public.courses; 

-- 3. Modify courses table for real usage
-- Add instructor_id linking to profiles
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add format column
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS format TEXT CHECK (format IN ('live', 'recorded', 'hybrid'));

-- Add status column
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));

-- Remove legacy string 'instructor' column if we are moving to relation, 
-- but might keep it as a cache or display name? Let's drop it to force usage of relation.
-- ALTER TABLE public.courses DROP COLUMN IF EXISTS instructor; 
-- Actually, let's keep it for now but make it nullable/optional or use it for display name. 
-- Better to drop it eventually, but let's leave it alone to avoid breaking too much TS code immediately. 
-- We will update TS types later.

-- 4. RLS Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id );

-- Courses Policies (Update existing or create new)

-- Everyone can view published courses
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
CREATE POLICY "Published courses are viewable by everyone" 
ON public.courses FOR SELECT 
USING ( status = 'published' );

-- Instructors can insert courses
DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
CREATE POLICY "Instructors can create courses" 
ON public.courses FOR INSERT 
WITH CHECK ( 
    auth.uid() = instructor_id 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'instructor'
    ) 
);

-- Instructors can update their own courses
DROP POLICY IF EXISTS "Instructors can update own courses" ON public.courses;
CREATE POLICY "Instructors can update own courses" 
ON public.courses FOR UPDATE 
USING ( auth.uid() = instructor_id );

-- Instructors can delete their own courses
DROP POLICY IF EXISTS "Instructors can delete own courses" ON public.courses;
CREATE POLICY "Instructors can delete own courses" 
ON public.courses FOR DELETE 
USING ( auth.uid() = instructor_id );

-- 5. Trigger for updated_at on profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 6. Trigger to create profile on Signup (optional but recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    'student' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dropping trigger first to avoid conflicts if recreating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
