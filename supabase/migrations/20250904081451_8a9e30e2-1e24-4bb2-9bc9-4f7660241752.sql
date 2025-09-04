-- Create secure functions for quiz questions access

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy to restrict direct access to questions table
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;

-- Create more restrictive policy - only allow access through our secure functions
CREATE POLICY "Restrict direct question access" ON questions
FOR SELECT USING (false);

-- Grant execute permissions on the new functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_taking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_results(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_for_taking(UUID) TO anon;

-- Create an index to improve performance of the security check
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_quiz ON quiz_results(user_id, quiz_id);