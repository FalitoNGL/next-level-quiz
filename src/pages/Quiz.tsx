import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type Quiz = {
  id: string;
  title: string;
  category: string;
  description?: string;
  questions: Question[];
};

type Question = {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
};

type QuestionResult = {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
};

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    if (quizId) {
      fetchQuizData(quizId);
    }
  }, [quizId]);

  const handleQuizComplete = useCallback(() => {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / quiz?.questions.length || 0) * 100);
    
    navigate("/results", { 
      state: { 
        quiz, 
        results, 
        score,
        totalQuestions: quiz?.questions.length || 0
      } 
    });
  }, [results, quiz, navigate]);

  // Timer countdown - moved before early returns
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleQuizComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, handleQuizComplete]);

  const fetchQuizData = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (quizError) throw quizError;

      // Fetch questions for this quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', id)
        .order('created_at');

      if (questionsError) throw questionsError;

      const formattedQuiz: Quiz = {
        id: quizData.id,
        title: quizData.title,
        category: quizData.category,
        description: quizData.description,
        questions: questionsData.map(q => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options as string[],
          correct_answer: q.correct_answer,
          explanation: q.explanation
        }))
      };

      setQuiz(formattedQuiz);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      // You could show a toast error here
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Memuat quiz...</h2>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz tidak ditemukan</h2>
          <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowResult(true);

    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = answerIndex === currentQuestion.correct_answer;
    
    const result: QuestionResult = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeSpent
    };
    
    setResults(prev => [...prev, result]);

    // Auto advance after 2 seconds
    setTimeout(() => {
      handleNextQuestion();
    }, 2500);
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    } else {
      handleQuizComplete();
    }
  };

  const getAnswerClass = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index 
        ? "answer-button border-primary bg-primary/10" 
        : "answer-button";
    }
    
    if (!currentQuestion) return "answer-button disabled";
    
    if (index === currentQuestion.correct_answer) {
      return "answer-button correct";
    }
    
    if (selectedAnswer === index && index !== currentQuestion.correct_answer) {
      return "answer-button incorrect";
    }
    
    return "answer-button disabled";
  };

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl gradient-text">{quiz.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">{quiz.category}</Badge>
                  <span className="text-muted-foreground">
                    Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-lg font-mono mb-1">
                  <Clock className="h-5 w-5 mr-2 text-warning" />
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-muted-foreground">Waktu tersisa</div>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="mb-6 animate-fade-slide-up">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.question_text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={getAnswerClass(index)}
                    disabled={isAnswered}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 font-semibold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-left">{option}</span>
                      {showResult && index === currentQuestion.correct_answer && (
                        <CheckCircle className="h-5 w-5 ml-auto text-green-500" />
                      )}
                      {showResult && selectedAnswer === index && index !== currentQuestion.correct_answer && (
                        <XCircle className="h-5 w-5 ml-auto text-red-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg animate-fade-slide-up">
                  <h4 className="font-semibold mb-2 text-primary">Penjelasan:</h4>
                  <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Keluar Quiz
          </Button>

          {showResult && (
            <Button 
              onClick={handleNextQuestion}
              className="btn-glow flex items-center"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? "Pertanyaan Selanjutnya" : "Lihat Hasil"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;