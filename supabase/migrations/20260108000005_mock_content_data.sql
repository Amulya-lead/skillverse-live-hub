-- Insert mock data for course modules and content
-- Assuming we stick this into the first available course (we'll fetch one dynamically in practice, but here we can just pick one or use a known ID if we had it. 
-- For safety, let's use a DO block to find a course.)

DO $$
DECLARE
  v_course_id uuid;
  v_module_id uuid;
BEGIN
  -- Select a course to add content to (limit 1)
  SELECT id INTO v_course_id FROM public.courses LIMIT 1;

  IF v_course_id IS NOT NULL THEN
    -- MODULE 1: Introduction
    INSERT INTO public.course_modules (course_id, title, description, order_index)
    VALUES (v_course_id, 'Introduction & Setup', 'Getting started with the course tools.', 1)
    RETURNING id INTO v_module_id;

    -- Content for Module 1
    INSERT INTO public.course_content_items (module_id, title, type, content_url, description, duration, order_index, is_free_preview)
    VALUES 
    (v_module_id, 'Welcome to the Course', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'An introduction to what you will learn', 120, 1, true),
    (v_module_id, 'Course Syllabus (PDF)', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Download the full syllabus', 0, 2, false),
    (v_module_id, 'Join the Community', 'note', null, 'Join our Discord server: https://discord.gg/example', 0, 3, false);

    -- MODULE 2: Core Concepts
    INSERT INTO public.course_modules (course_id, title, description, order_index)
    VALUES (v_course_id, 'Core Concepts', 'Deep dive into the main topics.', 2)
    RETURNING id INTO v_module_id;

    -- Content for Module 2
    INSERT INTO public.course_content_items (module_id, title, type, content_url, description, duration, order_index, is_free_preview)
    VALUES 
    (v_module_id, 'Understanding the Basics', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Fundamental principles explained', 600, 1, false),
    (v_module_id, 'Assignment: First Project', 'assignment', null, 'Create a "Hello World" application and submit the GitHub link.', 0, 2, false);

  END IF;
END $$;
