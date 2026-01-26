-- Remove all courses and related data (cascades to modules, items, slots, enrollments, reviews, etc.)
TRUNCATE TABLE public.courses CASCADE;

-- Optionally, if we want to clear live sessions that might be orphaned (though they should be linked to courses, but check if any are independent)
TRUNCATE TABLE public.live_sessions CASCADE;

-- Note: We are preserving public.profiles so users (Instructors/Students) can still log in.
-- If you want to delete specific test users, you would need to do that by ID or email matching 'test@...'
