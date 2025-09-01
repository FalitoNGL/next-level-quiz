import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Trophy, Users, Clock, BookOpen, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock quiz data - would come from Supabase in full implementation
const mockQuizzes = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of JavaScript basics including variables, functions, and DOM manipulation.",
    category: "Programming",
    questions: 10,
    difficulty: "Beginner",
    duration: 15,
    color: "from-blue-500 to-purple-600"
  },
  {
    id: 2,
    title: "React Hooks Mastery",
    description: "Deep dive into React hooks including useState, useEffect, and custom hooks.",
    category: "React",
    questions: 12,
    difficulty: "Intermediate",
    duration: 20,
    color: "from-green-500 to-teal-600"
  },
  {
    id: 3,
    title: "TypeScript Essentials",
    description: "Learn TypeScript fundamentals including types, interfaces, and generics.",
    category: "TypeScript", 
    questions: 8,
    difficulty: "Intermediate",
    duration: 12,
    color: "from-orange-500 to-red-600"
  },
  {
    id: 4,
    title: "Web Security Basics",
    description: "Essential web security concepts every developer should know.",
    category: "Security",
    questions: 15,
    difficulty: "Advanced",
    duration: 25,
    color: "from-pink-500 to-rose-600"
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-success/20 text-success border-success/30";
    case "Intermediate":
      return "bg-warning/20 text-warning border-warning/30";
    case "Advanced":
      return "bg-error/20 text-error border-error/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Index = () => {
  const navigate = useNavigate();

  const handleStartQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">QuizMaster</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Beranda
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Kuis Saya
              </a>
              <Button variant="outline" size="sm">
                Masuk
              </Button>
              <Button size="sm" className="btn-glow">
                Daftar
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-slide-up">
            <span className="gradient-text">Test Your Knowledge</span>
            <br />
            <span className="text-foreground">Master New Skills</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
            Bergabunglah dengan platform kuis interaktif yang menantang dan menyenangkan. Uji pengetahuan Anda dan pelajari hal baru setiap hari.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
            <Button size="lg" className="btn-glow text-lg px-8 py-6">
              <PlayCircle className="mr-2 h-5 w-5" />
              Mulai Quiz Sekarang
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <BookOpen className="mr-2 h-5 w-5" />
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="quiz-card text-center">
              <CardContent className="pt-6">
                <Trophy className="h-12 w-12 mx-auto text-primary mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">10,000+</div>
                <div className="text-muted-foreground">Quiz Diselesaikan</div>
              </CardContent>
            </Card>
            <Card className="quiz-card text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 mx-auto text-secondary mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">2,500+</div>
                <div className="text-muted-foreground">Pengguna Aktif</div>
              </CardContent>
            </Card>
            <Card className="quiz-card text-center">
              <CardContent className="pt-6">
                <BookOpen className="h-12 w-12 mx-auto text-success mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">50+</div>
                <div className="text-muted-foreground">Kategori Quiz</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quiz Collection */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Quiz Populer</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Jelajahi koleksi quiz berkualitas tinggi yang dirancang untuk meningkatkan kemampuan Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {mockQuizzes.map((quiz, index) => (
              <Card key={quiz.id} className="quiz-card group" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {quiz.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {quiz.category}
                    </Badge>
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{quiz.questions} pertanyaan</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>~{quiz.duration} menit</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="w-full btn-glow group-hover:scale-105 transition-transform"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Mulai Quiz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">QuizMaster</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 QuizMaster. Platform pembelajaran interaktif.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;