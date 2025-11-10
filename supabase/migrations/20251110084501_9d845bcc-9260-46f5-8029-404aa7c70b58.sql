-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create live_sessions table
CREATE TABLE public.live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id),
  instructor_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text,
  scheduled_start timestamp with time zone NOT NULL,
  scheduled_end timestamp with time zone NOT NULL,
  actual_start timestamp with time zone,
  actual_end timestamp with time zone,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  session_link text,
  recording_url text,
  max_participants integer DEFAULT 50,
  current_participants integer DEFAULT 0,
  chat_enabled boolean DEFAULT true,
  mute_all boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Create session_participants table
CREATE TABLE public.session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  left_at timestamp with time zone,
  status text DEFAULT 'active' CHECK (status IN ('active', 'left', 'kicked')),
  audio_enabled boolean DEFAULT true,
  video_enabled boolean DEFAULT true,
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'poll')),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create session_notes table
CREATE TABLE public.session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- Create user_settings table
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  default_audio_enabled boolean DEFAULT true,
  default_video_enabled boolean DEFAULT true,
  notifications_enabled boolean DEFAULT true,
  theme text DEFAULT 'light',
  language text DEFAULT 'en',
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create code_snippets table
CREATE TABLE public.code_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  language text DEFAULT 'javascript',
  output text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

-- Create session_recordings table
CREATE TABLE public.session_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
  recording_url text NOT NULL,
  duration integer,
  file_size bigint,
  available_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for live_sessions
CREATE POLICY "Anyone can view scheduled/live sessions"
  ON public.live_sessions FOR SELECT
  USING (status IN ('scheduled', 'live'));

CREATE POLICY "Admins and instructors can create sessions"
  ON public.live_sessions FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'instructor')
  );

CREATE POLICY "Instructors can update their own sessions"
  ON public.live_sessions FOR UPDATE
  USING (auth.uid() = instructor_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for session_participants
CREATE POLICY "Users can view participants in their joined sessions"
  ON public.session_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_participants sp
      WHERE sp.session_id = session_participants.session_id
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join sessions"
  ON public.session_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participant status"
  ON public.session_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in joined sessions"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_participants sp
      WHERE sp.session_id = chat_messages.session_id
      AND sp.user_id = auth.uid()
      AND sp.status = 'active'
    )
  );

CREATE POLICY "Users can send messages in active sessions"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.session_participants sp
      JOIN public.live_sessions ls ON ls.id = sp.session_id
      WHERE sp.session_id = chat_messages.session_id
      AND sp.user_id = auth.uid()
      AND sp.status = 'active'
      AND ls.status = 'live'
      AND ls.chat_enabled = true
    )
  );

-- RLS Policies for session_notes
CREATE POLICY "Users can manage their own notes"
  ON public.session_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can manage their own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for code_snippets
CREATE POLICY "Users can manage their own snippets"
  ON public.code_snippets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Instructors can view all snippets in their sessions"
  ON public.code_snippets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_sessions ls
      WHERE ls.id = code_snippets.session_id
      AND ls.instructor_id = auth.uid()
    )
  );

-- RLS Policies for session_recordings
CREATE POLICY "Users can view recordings of sessions they attended"
  ON public.session_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_participants sp
      WHERE sp.session_id = session_recordings.session_id
      AND sp.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_live_sessions
  BEFORE UPDATE ON public.live_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_session_notes
  BEFORE UPDATE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_settings
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Realtime for chat and participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;