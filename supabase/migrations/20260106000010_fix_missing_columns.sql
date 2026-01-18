-- Safely add 'role' column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'student';
        ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'instructor', 'admin'));
    END IF;
END $$;

-- Safely add 'instructor_id' to courses if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor_id') THEN
        ALTER TABLE public.courses ADD COLUMN instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Safely add 'format' to courses if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'format') THEN
        ALTER TABLE public.courses ADD COLUMN format TEXT CHECK (format IN ('live', 'recorded', 'hybrid'));
    END IF;
END $$;

-- Safely add 'status' to courses if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
        ALTER TABLE public.courses ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
    END IF;
END $$;

-- Re-apply policies just in case
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts when re-creating
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING ( true );
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ( auth.uid() = id );

-- Course policies
DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can update own courses" ON public.courses;

CREATE POLICY "Instructors can create courses" ON public.courses FOR INSERT WITH CHECK ( auth.uid() = instructor_id );
CREATE POLICY "Instructors can update own courses" ON public.courses FOR UPDATE USING ( auth.uid() = instructor_id );
