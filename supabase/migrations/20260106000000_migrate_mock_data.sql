-- Add missing columns to courses table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'level') THEN
        ALTER TABLE courses ADD COLUMN level TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'students_count') THEN
        ALTER TABLE courses ADD COLUMN students_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'rating') THEN
        ALTER TABLE courses ADD COLUMN rating NUMERIC DEFAULT 0;
    END IF;
    -- Ensure instructor column exists (it might be named instructor_name in some versions, but we want instructor)
    -- If instructor_name exists but instructor doesn't, we might need to rename, but for now let's assume we just need to ensure 'instructor' exists or is used.
    -- The user stated the existing schema has 'instructor'.
END $$;

-- Create courses table if it doesn't exist (using UUID and instructor)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  price NUMERIC,
  instructor TEXT,
  image_url TEXT,
  level TEXT,
  students_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0
);

-- Create course_offerings table
CREATE TABLE IF NOT EXISTS course_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  offering TEXT NOT NULL
);

-- Create course_perks table
CREATE TABLE IF NOT EXISTS course_perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  perk TEXT NOT NULL
);

-- Create course_syllabus table
CREATE TABLE IF NOT EXISTS course_syllabus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  order_index INTEGER
);

-- Create course_slots table
CREATE TABLE IF NOT EXISTS course_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN DEFAULT true
);

-- Insert mock data (using specific UUIDs to maintain relationships)
-- We use ON CONFLICT DO NOTHING to avoid duplicate insertions if run multiple times

INSERT INTO courses (id, title, description, duration, price, instructor, image_url, level, students_count, rating) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '4 Hours of OOPS in Java', 'Master Object-Oriented Programming concepts with hands-on practice', '4 hours', 999, 'Rahul Sharma', '/course-java.jpg', 'Intermediate', 234, 4.8),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2 Hours of Photoshop Basics', 'Learn essential Photoshop tools and techniques from scratch', '2 hours', 599, 'Priya Desai', '/course-photoshop.jpg', 'Beginner', 456, 4.5),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '5 Hours of Modern Web Dev', 'Build responsive websites with HTML, CSS, and JavaScript', '5 hours', 1299, 'Amit Patel', '/course-web.jpg', 'Beginner', 789, 4.7),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '6 Hours of Data Structures', 'Deep dive into essential DS concepts with real-world examples', '6 hours', 1499, 'Neha Singh', '/course-ds.jpg', 'Advanced', 345, 4.9)
ON CONFLICT (id) DO NOTHING;

-- Insert Offerings for Java Course
INSERT INTO course_offerings (course_id, offering) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Live interactive video session with Q&A'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hands-on coding exercises'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Real-world project examples'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Access to code editor during session'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Live notepad for collaborative learning'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Instant doubt resolution via chat');

-- Insert Perks for Java Course
INSERT INTO course_perks (course_id, perk) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Auto-generated certificate upon completion'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lifetime access to session recordings'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Free PDF notes and code samples'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Priority support for 7 days post-session'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Access to private Discord community'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '30-day money-back guarantee');

-- Insert Syllabus for Java Course
INSERT INTO course_syllabus (course_id, topic, order_index) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Introduction to OOP concepts', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Classes and Objects in Java', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Inheritance and Polymorphism', 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Encapsulation and Abstraction', 4),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Practical implementation exercises', 5);

-- Insert Slots for Java Course
INSERT INTO course_slots (course_id, start_time, end_time, is_available) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-11-11 10:00:00+00', '2024-11-11 14:00:00+00', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-11-11 15:00:00+00', '2024-11-11 19:00:00+00', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-11-12 10:00:00+00', '2024-11-12 14:00:00+00', false),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-11-12 15:00:00+00', '2024-11-12 19:00:00+00', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-11-13 10:00:00+00', '2024-11-13 14:00:00+00', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-11-13 15:00:00+00', '2024-11-13 19:00:00+00', true);
