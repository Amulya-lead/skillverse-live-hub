-- 1. Profiles Table Updates
DO $$
BEGIN
    -- Add role column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'student';
    END IF;
    
    -- Add constraint safely (we just try to drop it first to be sure, or we can catch the error)
    -- Simplest way in a migration block ensuring idempotency:
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'instructor', 'admin'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 2. Courses Table Updates
DO $$
BEGIN
    -- Add instructor_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor_id') THEN
        ALTER TABLE public.courses ADD COLUMN instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- Add format
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'format') THEN
        ALTER TABLE public.courses ADD COLUMN format TEXT CHECK (format IN ('live', 'recorded', 'hybrid'));
    END IF;

    -- Add status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
        ALTER TABLE public.courses ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
    END IF;
END $$;

-- 3. RLS - Re-apply to be sure
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ( auth.uid() = id );

-- Courses Policies
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING ( status = 'published' );

DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
CREATE POLICY "Instructors can create courses" ON public.courses FOR INSERT WITH CHECK ( auth.uid() = instructor_id );

DROP POLICY IF EXISTS "Instructors can update own courses" ON public.courses;
CREATE POLICY "Instructors can update own courses" ON public.courses FOR UPDATE USING ( auth.uid() = instructor_id );

DROP POLICY IF EXISTS "Instructors can delete own courses" ON public.courses;
CREATE POLICY "Instructors can delete own courses" ON public.courses FOR DELETE USING ( auth.uid() = instructor_id );
