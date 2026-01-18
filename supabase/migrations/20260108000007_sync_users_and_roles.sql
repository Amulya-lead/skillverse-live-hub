-- 0. DATA SANITIZATION (Fix existing bad data before applying constraints)
-- Convert 'tutor' to 'instructor'
UPDATE public.user_roles SET role = 'instructor' WHERE role = 'tutor';
UPDATE public.profiles SET role = 'instructor' WHERE role = 'tutor';

-- Convert any other invalid roles to 'student' to ensure constraints pass
UPDATE public.user_roles 
SET role = 'student' 
WHERE role NOT IN ('admin', 'student', 'instructor');

UPDATE public.profiles 
SET role = 'student' 
WHERE role NOT IN ('admin', 'student', 'instructor');


-- 1. Update user_roles check constraint to include 'instructor'
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('admin', 'student', 'instructor'));

-- 2. Update profiles check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'student', 'instructor'));

-- 3. Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
-- Insert into profiles
INSERT INTO public.profiles (id, full_name, avatar_url, role)
VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    'student'
)
ON CONFLICT (id) DO NOTHING;

-- Insert into user_roles
INSERT INTO public.user_roles (user_id, role)
VALUES (
    NEW.id,
    'student'
)
ON CONFLICT DO NOTHING;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Backfill Profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
id, 
email, 
raw_user_meta_data->>'full_name', 
'student'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 5. Backfill User Roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
id, 
'student'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles);
