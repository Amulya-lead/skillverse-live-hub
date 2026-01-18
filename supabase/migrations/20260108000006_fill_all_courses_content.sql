-- Add content to ALL courses to ensure visibility during testing
DO $$
DECLARE
  r_course RECORD;
  v_module_id uuid;
BEGIN
  FOR r_course IN SELECT id FROM public.courses LOOP
    -- Check if module already exists to avoid duplicates if run multiple times
    IF NOT EXISTS (SELECT 1 FROM public.course_modules WHERE course_id = r_course.id) THEN
      
      -- MODULE 1: Introduction
      INSERT INTO public.course_modules (course_id, title, description, order_index)
      VALUES (r_course.id, 'Introduction & Setup', 'Getting started with the course tools.', 1)
      RETURNING id INTO v_module_id;

      -- Content for Module 1
      INSERT INTO public.course_content_items (module_id, title, type, content_url, description, duration, order_index, is_free_preview)
      VALUES 
      (v_module_id, 'Welcome to the Course', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'An introduction to what you will learn', 120, 1, true),
      (v_module_id, 'Course Syllabus (PDF)', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Download the full syllabus', 0, 2, false);

      -- MODULE 2: Core Concepts
      INSERT INTO public.course_modules (course_id, title, description, order_index)
      VALUES (r_course.id, 'Core Concepts', 'Deep dive into the main topics.', 2)
      RETURNING id INTO v_module_id;

      -- Content for Module 2
      INSERT INTO public.course_content_items (module_id, title, type, content_url, description, duration, order_index, is_free_preview)
      VALUES 
      (v_module_id, 'Understanding the Basics', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Fundamental principles explained', 600, 1, false);
      
    END IF;
  END LOOP;
END $$;
