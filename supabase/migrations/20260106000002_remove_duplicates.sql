-- Remove duplicate courses (keeping the one with the specific UUIDs we inserted, or the latest one)
DELETE FROM courses a USING courses b
WHERE a.id < b.id
AND a.title = b.title
AND a.instructor = b.instructor;

-- Remove duplicate course_offerings
DELETE FROM course_offerings a USING course_offerings b
WHERE a.id < b.id
AND a.course_id = b.course_id
AND a.offering = b.offering;

-- Remove duplicate course_perks
DELETE FROM course_perks a USING course_perks b
WHERE a.id < b.id
AND a.course_id = b.course_id
AND a.perk = b.perk;

-- Remove duplicate course_syllabus
DELETE FROM course_syllabus a USING course_syllabus b
WHERE a.id < b.id
AND a.course_id = b.course_id
AND a.topic = b.topic;

-- Remove duplicate course_slots
DELETE FROM course_slots a USING course_slots b
WHERE a.id < b.id
AND a.course_id = b.course_id
AND a.start_time = b.start_time
AND a.end_time = b.end_time;
