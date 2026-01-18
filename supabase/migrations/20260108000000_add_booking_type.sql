-- Add booking_type column to courses table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'booking_type') THEN
        ALTER TABLE public.courses ADD COLUMN booking_type TEXT DEFAULT 'standard' CHECK (booking_type IN ('standard', 'slot_based'));
    END IF;
END $$;
