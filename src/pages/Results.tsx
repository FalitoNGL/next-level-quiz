import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Home, RotateCcw, CheckCircle, XCircle, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { quiz, results, score, totalQuestions } = location.state || {};

  if (!quiz || !results) {
    navigate("/");
    return null;
  }

  const correctAnswers = results.filter((r: any) => r.isCorrect).length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const totalTimeSpent = results.reduce((acc: number, r: any) => acc + r.timeSpent, 0);
  const avgTimePerQuestion = Math.round(totalTimeSpent / totalQuestions / 1000);

  const getScoreColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning"; 
    return "text-error";
  };

  const getScoreMessage = () => {
    if (score >= 90) return "Luar Biasa! 🎉";
    if (score >= 80) return "Bagus Sekali! 👏";
    if (score >= 70) return "Cukup Baik! 👍";
    if (score >= 60) return "Tidak Buruk! 😊";
    return "Tetap Semangat! 💪";
  };

  const getPerformanceBadge = () => {
    if (score >= 90) return <Badge className="bg-success text-success-foreground">Sempurna</Badge>;
    if (score >= 80) return <Badge className="bg-primary text-primary-foreground">Hebat</Badge>;
    if (score >= 70) return <Badge className="bg-secondary text-secondary-foreground">Baik</Badge>;
    if (score >= 60) return <Badge className="bg-warning text-warning-foreground">Cukup</Badge>;
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
                {score}%
              </div>
              {getPerformanceBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-6 w-6 text-success mr-2" />
                  <span className="text-2xl font-bold text-success">{correctAnswers}</span>
                </div>
                <div className="text-muted-foreground">Jawaban Benar</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="h-6 w-6 text-error mr-2" />
                  <span className="text-2xl font-bold text-error">{totalQuestions - correctAnswers}</span>
                </div>
                <div className="text-muted-foreground">Jawaban Salah</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-warning mr-2" />
                  <span className="text-2xl font-bold text-warning">{avgTimePerQuestion}s</span>
                </div>
                <div className="text-muted-foreground">Rata-rata per Soal</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Akurasi</span>
                <span className="text-sm font-medium">{accuracy}%</span>
              </div>
              <Progress value={accuracy} className="h-3" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/")}
                variant="outline" 
                size="lg"
                className="flex items-center"
              >
                <Home className="mr-2 h-5 w-5" />
                Kembali ke Beranda
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                size="lg" 
                className="btn-glow flex items-center"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Ulangi Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Info */}
        <Card className="mb-6 animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-6 w-6 text-primary" />
              Ringkasan Quiz: {quiz.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Pertanyaan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{quiz.category}</div>
                <div className="text-sm text-muted-foreground">Kategori</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{correctAnswers}/{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Skor Akhir</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{Math.round(totalTimeSpent/1000/60)}m</div>
                <div className="text-sm text-muted-foreground">Waktu Total</div>
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
              {quiz.questions.map((question: any, index: number) => {
                const result = results[index];
                const isCorrect = result?.isCorrect;
                
                return (
                  <div key={question.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-muted-foreground mr-2">
                            Pertanyaan {index + 1}
                          </span>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <XCircle className="h-5 w-5 text-error" />
                          )}
                        </div>
                        <h4 className="font-medium mb-3">{question.question_text}</h4>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      {question.options.map((option: string, optionIndex: number) => {
                        const isSelected = result?.selectedAnswer === optionIndex;
                        const isCorrectOption = optionIndex === question.correct_answer;
                        
                        let className = "p-3 rounded border text-sm ";
                        
                        if (isCorrectOption) {
                          className += "border-success bg-success/10 text-success";
                        } else if (isSelected && !isCorrectOption) {
                          className += "border-error bg-error/10 text-error";
                        } else {
                          className += "border-border bg-muted/30 text-muted-foreground";
                        }
                        
                        return (
                          <div key={optionIndex} className={className}>
                            <div className="flex items-center">
                              <span className="font-medium mr-3">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span>{option}</span>
                              {isSelected && (
                                <span className="ml-auto text-xs font-medium">
                                  Jawaban Anda
                                </span>
                              )}
                              {isCorrectOption && (
                                <CheckCircle className="ml-auto h-4 w-4" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 p-3 bg-muted/50 rounded text-sm text-muted-foreground">
                      <strong>Penjelasan:</strong> {question.explanation}
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