import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock quiz data - would come from Supabase
const mockQuizData = {
  1: {
    id: 1,
    title: "JavaScript Fundamentals",
    category: "Programming",
    questions: [
      {
        id: 1,
        question: "Apa output dari console.log(typeof null) di JavaScript?",
        options: [
          "null",
          "undefined", 
          "object",
          "string"
        ],
        correctAnswer: 2,
        explanation: "Ini adalah bug terkenal dalam JavaScript. typeof null mengembalikan 'object', bukan 'null'."
      },
      {
        id: 2,
        question: "Manakah cara yang benar untuk mendeklarasikan variabel dalam JavaScript ES6?",
        options: [
          "var name = 'John';",
          "let name = 'John';",
          "const name = 'John';",
          "Semua jawaban benar"
        ],
        correctAnswer: 3,
        explanation: "Semua cara tersebut valid, tetapi let dan const lebih direkomendasikan untuk ES6+."
      },
      {
        id: 3,
        question: "Apa itu closure dalam JavaScript?",
        options: [
          "Function yang dapat mengakses variabel dari scope luar",
          "Method untuk menutup browser",
          "Cara untuk menyembunyikan kode",
          "Error handling mechanism"
        ],
        correctAnswer: 0,
        explanation: "Closure memungkinkan function untuk mengakses variabel dari lexical scope-nya bahkan setelah outer function selesai dieksekusi."
      }
    ]
  }
};

type QuestionResult = {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
};

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const quiz = mockQuizData[parseInt(quizId || "1") as keyof typeof mockQuizData];
  
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

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleQuizComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowResult(true);

    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
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
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    
    navigate("/results", { 
      state: { 
        quiz, 
        results, 
        score,
        totalQuestions: quiz.questions.length 
      } 
    });
  };

  const getAnswerClass = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index 
        ? "answer-button border-primary bg-primary/10" 
        : "answer-button";
    }
    
    if (index === currentQuestion.correctAnswer) {
      return "answer-button correct";
    }
    
    if (selectedAnswer === index && index !== currentQuestion.correctAnswer) {
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
        <Card className="mb-6 animate-fade-slide-up">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.question}
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
                    {showResult && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="h-5 w-5 ml-auto text-green-500" />
                    )}
                    {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
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