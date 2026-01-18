-- List all courses to see actual IDs
SELECT id, title, instructor FROM courses;

-- Count offerings for each course
SELECT course_id, COUNT(*) as offering_count FROM course_offerings GROUP BY course_id;

-- Check RLS Policy Status (pg_policies view)
SELECT tablename, policyname, roles, cmd, qual, permissive 
FROM pg_policies 
WHERE tablename IN ('courses', 'course_offerings');

-- Check if RLS is enabled on tables
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('courses', 'course_offerings');
