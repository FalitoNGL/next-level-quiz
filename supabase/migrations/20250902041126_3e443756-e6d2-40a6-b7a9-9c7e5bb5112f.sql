-- Create enum for quiz categories
CREATE TYPE quiz_category AS ENUM ('Programming', 'Science', 'History', 'Math', 'General Knowledge');

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category quiz_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer INTEGER NOT NULL, -- Index of correct answer (0-based)
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quiz_results table to store user quiz results
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  answers JSONB NOT NULL, -- Store user answers and results
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quizzes (public read access)
CREATE POLICY "Anyone can view active quizzes" ON public.quizzes
  FOR SELECT USING (is_active = true);

-- RLS Policies for questions (public read access)
CREATE POLICY "Anyone can view questions" ON public.questions
  FOR SELECT USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for quiz_results
CREATE POLICY "Users can view their own quiz results" ON public.quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results" ON public.quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample quiz data
INSERT INTO public.quizzes (title, description, category) VALUES
('JavaScript Fundamentals', 'Test your knowledge of JavaScript basics', 'Programming'),
('World History Quiz', 'Challenge yourself with historical facts', 'History'),
('Mathematics Challenge', 'Solve mathematical problems', 'Math');

-- Insert sample questions for JavaScript quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
  (SELECT id FROM public.quizzes WHERE title = 'JavaScript Fundamentals'),
  'Apa output dari console.log(typeof null) di JavaScript?',
  '["null", "undefined", "object", "string"]'::jsonb,
  2,
  'Ini adalah bug terkenal dalam JavaScript. typeof null mengembalikan ''object'', bukan ''null''.'
UNION ALL
SELECT 
  (SELECT id FROM public.quizzes WHERE title = 'JavaScript Fundamentals'),
  'Manakah cara yang benar untuk mendeklarasikan variabel dalam JavaScript ES6?',
  '["var name = ''John'';", "let name = ''John'';", "const name = ''John'';", "Semua jawaban benar"]'::jsonb,
  3,
  'Semua cara tersebut valid, tetapi let dan const lebih direkomendasikan untuk ES6+.'
UNION ALL
SELECT 
  (SELECT id FROM public.quizzes WHERE title = 'JavaScript Fundamentals'),
  'Apa itu closure dalam JavaScript?',
  '["Function yang dapat mengakses variabel dari scope luar", "Method untuk menutup browser", "Cara untuk menyembunyikan kode", "Error handling mechanism"]'::jsonb,
  0,
  'Closure memungkinkan function untuk mengakses variabel dari lexical scope-nya bahkan setelah outer function selesai dieksekusi.';

-- Create indexes for better performance
CREATE INDEX idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX idx_quiz_results_quiz_id ON public.quiz_results(quiz_id);