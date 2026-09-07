CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  branch TEXT NOT NULL DEFAULT 'B.Tech CSE',
  year INT NOT NULL DEFAULT 3,
  batch TEXT NOT NULL DEFAULT '2022-26',
  focus_area TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  domains TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  capacity INT NOT NULL DEFAULT 4,
  bio TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mentors TO authenticated;
GRANT ALL ON public.mentors TO service_role;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentors readable" ON public.mentors FOR SELECT TO authenticated USING (true);

CREATE TABLE public.allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.mentors ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.allocations TO authenticated;
GRANT ALL ON public.allocations TO service_role;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own allocation" ON public.allocations FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.mentors ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own feedback" ON public.feedback FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.mentors (name, role, department, expertise, domains, rating, capacity, bio) VALUES
('Dr. R. Menon', 'Professor', 'Dept. of CSE', ARRAY['Computer Vision','Deep Learning','PyTorch','Python'], ARRAY['Research','Computer Vision','Deep Learning'], 4.9, 4, 'Leads the vision and perception group; has guided 30+ undergraduate theses in image understanding.'),
('Meera Iyer', 'Industry Mentor', 'AI Platform, Bengaluru', ARRAY['NLP','LLM Systems','Python','MLOps'], ARRAY['Product AI','NLP','Applied ML'], 4.7, 2, 'Builds production language systems; mentors students on shipping models to real users.'),
('Prof. S. Raghavan', 'Research Head', 'Dept. of CSE', ARRAY['Distributed Systems','MLOps','Cloud','Docker'], ARRAY['Systems','Distributed AI','Research'], 4.6, 1, 'Works on large-scale training infrastructure and distributed AI systems.'),
('Dr. Kavya Nair', 'Associate Professor', 'Dept. of AI & DS', ARRAY['Machine Learning','Statistics','Python','Data Analysis'], ARRAY['Applied ML','Research','Data Science'], 4.8, 5, 'Focus on interpretable machine learning and applied statistics for engineering problems.'),
('Arjun Rao', 'Industry Mentor', 'Robotics Startup', ARRAY['Robotics','Embedded C','Computer Vision','ROS'], ARRAY['Robotics','Computer Vision','Systems'], 4.5, 3, 'Hands-on robotics engineer; great for hardware-meets-AI capstone projects.'),
('Dr. Sara Iqbal', 'Assistant Professor', 'Dept. of CSE', ARRAY['NLP','Transformers','PyTorch','Research Writing'], ARRAY['NLP','Research','Deep Learning'], 4.7, 4, 'Low-resource language modelling and academic writing guidance for first papers.'),
('Nikhil Verma', 'Industry Mentor', 'Cloud Infrastructure', ARRAY['MLOps','Kubernetes','Cloud','Python'], ARRAY['Systems','Applied ML','DevOps'], 4.4, 4, 'Deployment, monitoring and cost-aware ML infrastructure for student projects.'),
('Dr. Anita Bose', 'Professor', 'Dept. of CSE', ARRAY['Cybersecurity','Networks','Cryptography','Python'], ARRAY['Security','Systems','Research'], 4.6, 3, 'Security and privacy in machine learning pipelines; strong on rigorous evaluation.');