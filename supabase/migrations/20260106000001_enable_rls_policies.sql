-- Enable RLS on tables (if not already enabled)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on courses"
ON courses FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access on course_offerings"
ON course_offerings FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access on course_perks"
ON course_perks FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access on course_syllabus"
ON course_syllabus FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access on course_slots"
ON course_slots FOR SELECT
TO public
USING (true);
