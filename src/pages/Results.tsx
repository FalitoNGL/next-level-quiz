import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Home, RotateCcw, CheckCircle, XCircle, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Quiz {
  id: string;
  title: string;
  category: string;
  description: string;
  questions: Question[];
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface QuestionResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { quizId, results, score, totalQuestions } = location.state || {};
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<Question[]>([]);
  const [correctedResults, setCorrectedResults] = useState<QuestionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (quizId && results) {
      fetchQuizWithAnswers();
    } else {
      navigate("/");
    }
  }, [quizId, results]);

  const fetchQuizWithAnswers = async () => {
    try {
      setIsLoading(true);

      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      // Fetch complete question data with answers (requires completed quiz)
      const { data: questionsData, error: questionsError } = await supabase
        .rpc('get_quiz_questions_for_results', { quiz_uuid: quizId });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        toast({
          title: "Error",
          description: "Tidak dapat memuat jawaban. Pastikan Anda telah menyelesaikan kuis.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

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
      setQuestionsWithAnswers(formattedQuiz.questions);

      // Calculate correct results now that we have the answers
      const corrected = results.map((result: any) => {
        const question = formattedQuiz.questions.find(q => q.id === result.questionId);
        return {
          ...result,
          isCorrect: question ? result.selectedAnswer === question.correct_answer : false
        };
      });
      setCorrectedResults(corrected);

    } catch (error) {
      console.error('Error fetching quiz results:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat hasil kuis.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat hasil kuis...</p>
        </Card>
      </div>
    );
  }

  if (!quiz || !correctedResults.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Data hasil kuis tidak ditemukan</p>
          <Button onClick={() => navigate('/')}>Kembali ke Beranda</Button>
        </Card>
      </div>
    );
  }

  // Recalculate metrics with correct data
  const correctAnswers = correctedResults.filter(r => r.isCorrect).length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const totalTimeSpent = correctedResults.reduce((acc: number, r: QuestionResult) => acc + r.timeSpent, 0);
  const avgTimePerQuestion = Math.round(totalTimeSpent / totalQuestions / 1000);

  const getScoreColor = () => {
    if (accuracy >= 80) return "text-success";
    if (accuracy >= 60) return "text-warning"; 
    return "text-error";
  };

  const getScoreMessage = () => {
    if (accuracy >= 90) return "Luar Biasa! 🎉";
    if (accuracy >= 80) return "Bagus Sekali! 👏";
    if (accuracy >= 70) return "Cukup Baik! 👍";
    if (accuracy >= 60) return "Tidak Buruk! 😊";
    return "Tetap Semangat! 💪";
  };

  const getPerformanceBadge = () => {
    if (accuracy >= 90) return <Badge className="bg-success text-success-foreground">Sempurna</Badge>;
    if (accuracy >= 80) return <Badge className="bg-primary text-primary-foreground">Hebat</Badge>;
    if (accuracy >= 70) return <Badge className="bg-secondary text-secondary-foreground">Baik</Badge>;
    if (accuracy >= 60) return <Badge className="bg-warning text-warning-foreground">Cukup</Badge>;
    return <Badge variant="destructive">Perlu Latihan</Badge>;
  };

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header Score Card */}
        <Card className="mb-8 text-center animate-scale-in">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl mb-2">{getScoreMessage()}</CardTitle>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`score-display ${getScoreColor()}`}>
                {accuracy}%
              </div>
              {getPerformanceBadge()}
            </div>
            <Progress value={accuracy} className="w-48 mx-auto" />
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardContent className="pt-6">
              <Target className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">{correctAnswers}</div>
              <p className="text-sm text-muted-foreground">Jawaban Benar</p>
            </CardContent>
          </Card>
          <Card className="text-center animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{avgTimePerQuestion}s</div>
              <p className="text-sm text-muted-foreground">Rata-rata per Soal</p>
            </CardContent>
          </Card>
          <Card className="text-center animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardContent className="pt-6">
              <Trophy className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-warning">{accuracy}%</div>
              <p className="text-sm text-muted-foreground">Tingkat Akurasi</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
          <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Kembali ke Beranda
          </Button>
          <Button onClick={() => navigate(`/quiz/${quiz.id}`)} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Ulangi Kuis
          </Button>
        </div>

        {/* Quiz Info Card */}
        <Card className="mb-8 animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{quiz.title}</span>
              <Badge variant="secondary">{quiz.category}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                <p className="text-sm text-muted-foreground">Total Soal</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{correctAnswers}</div>
                <p className="text-sm text-muted-foreground">Benar</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">{totalQuestions - correctAnswers}</div>
                <p className="text-sm text-muted-foreground">Salah</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{Math.round(totalTimeSpent / 1000)}s</div>
                <p className="text-sm text-muted-foreground">Waktu Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card className="animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle>Review Jawaban</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questionsWithAnswers.map((question: Question, index: number) => {
                const result = correctedResults[index];
                const isCorrect = result?.isCorrect;
                
                return (
                  <div key={question.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-muted-foreground mr-2">
                            Soal {index + 1}
                          </span>
                          {isCorrect ? (
                            <Badge className="bg-success text-success-foreground">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Benar
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Salah
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-medium mb-4">{question.question_text}</h3>
                        
                        <div className="space-y-2 mb-4">
                          {question.options.map((option: string, optionIndex: number) => {
                            const isSelected = result?.selectedAnswer === optionIndex;
                            const isCorrectAnswer = optionIndex === question.correct_answer;
                            
                            let className = "p-3 rounded-lg border ";
                            if (isCorrectAnswer) {
                              className += "bg-success/10 border-success text-success-foreground";
                            } else if (isSelected && !isCorrectAnswer) {
                              className += "bg-destructive/10 border-destructive text-destructive-foreground";
                            } else {
                              className += "bg-background border-border";
                            }
                            
                            return (
                              <div key={optionIndex} className={className}>
                                <div className="flex items-center">
                                  {isCorrectAnswer && (
                                    <CheckCircle className="h-4 w-4 mr-2 text-success" />
                                  )}
                                  {isSelected && !isCorrectAnswer && (
                                    <XCircle className="h-4 w-4 mr-2 text-destructive" />
                                  )}
                                  <span>{option}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {question.explanation && (
                          <div className="bg-muted/50 rounded-lg p-3 mt-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Penjelasan:</h4>
                            <p className="text-sm">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;