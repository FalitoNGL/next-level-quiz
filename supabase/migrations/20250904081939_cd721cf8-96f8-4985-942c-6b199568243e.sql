-- Fix search path security warnings for the quiz functions

-- Drop and recreate the functions with proper search_path
DROP FUNCTION IF EXISTS public.get_quiz_questions_for_taking(UUID);
DROP FUNCTION IF EXISTS public.get_quiz_questions_for_results(UUID);

-- Function to get questions for quiz taking (without answers and explanations)
CREATE OR REPLACE FUNCTION public.get_quiz_questions_for_taking(quiz_uuid UUID)
RETURNS TABLE (
  id UUID,
  quiz_id UUID,
  question_text TEXT,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.quiz_id,
    q.question_text,
    q.options,
    q.created_at
  FROM questions q
  JOIN quizzes qz ON q.quiz_id = qz.id
  WHERE q.quiz_id = quiz_uuid AND qz.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get complete question data for results (requires user to have submitted results)
CREATE OR REPLACE FUNCTION public.get_quiz_questions_for_results(quiz_uuid UUID)
RETURNS TABLE (
  id UUID,
  quiz_id UUID,
  question_text TEXT,
  options JSONB,
  correct_answer INTEGER,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Check if the current user has submitted results for this quiz
  IF NOT EXISTS (
    SELECT 1 FROM quiz_results 
    WHERE quiz_id = quiz_uuid AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: You must complete the quiz first to view answers';
  END IF;

  RETURN QUERY
  SELECT 
    q.id,
    q.quiz_id,
    q.question_text,
    q.options,
    q.correct_answer,
    q.explanation,
    q.created_at
  FROM questions q
  JOIN quizzes qz ON q.quiz_id = qz.id
  WHERE q.quiz_id = quiz_uuid AND qz.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Also fix the existing handle_new_user function search path
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$function$;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_taking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_results(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_taking(UUID) TO anon;