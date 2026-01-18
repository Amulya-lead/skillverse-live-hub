-- Check the data type of 'id' in 'courses' table
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name = 'id';

-- Check if 'course_offerings' table exists and its column types
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'course_offerings';
