-- 1. Reload the API Schema Cache (Most important for 404 errors)
NOTIFY pgrst, 'reload config';

-- 2. Clean up ALL existing policies to ensure no conflicts (for 406/0 rows error)
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Allow public read access on courses" ON courses;
DROP POLICY IF EXISTS "Public read" ON courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;

DROP POLICY IF EXISTS "Allow public read access on course_offerings" ON course_offerings;
DROP POLICY IF EXISTS "Public read" ON course_offerings;

DROP POLICY IF EXISTS "Allow public read access on course_perks" ON course_perks;
DROP POLICY IF EXISTS "Public read" ON course_perks;

DROP POLICY IF EXISTS "Allow public read access on course_syllabus" ON course_syllabus;
DROP POLICY IF EXISTS "Public read" ON course_syllabus;

DROP POLICY IF EXISTS "Allow public read access on course_slots" ON course_slots;
DROP POLICY IF EXISTS "Public read" ON course_slots;

-- 3. Create ONE simple, clear policy for each table
CREATE POLICY "Public Access" ON courses FOR SELECT TO public USING (true);
CREATE POLICY "Public Access" ON course_offerings FOR SELECT TO public USING (true);
CREATE POLICY "Public Access" ON course_perks FOR SELECT TO public USING (true);
CREATE POLICY "Public Access" ON course_syllabus FOR SELECT TO public USING (true);
CREATE POLICY "Public Access" ON course_slots FOR SELECT TO public USING (true);

-- 4. Enable RLS (just in case)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_slots ENABLE ROW LEVEL SECURITY;

-- 5. Verification Output
SELECT 'Cache Reloaded' as status;
SELECT 'Policies Reset' as action;
SELECT count(*) as courses_count FROM courses;
SELECT count(*) as offerings_count FROM course_offerings;
