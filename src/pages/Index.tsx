
import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import QuizResults from '@/components/QuizResults';
import { Question, questions } from '@/data/questions';
import { animate } from '@/utils/animations';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  console.log("🚀 ~ Index ~ correctAnswers:", correctAnswers)
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  useEffect(() => {
    let filteredQuestions = [...questions];

    // Shuffle and limit to 5 questions
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));

    // Reset quiz state
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setCorrectAnswers(0);
    setUserAnswers([]);
  }, []);

  const handleNext = () => {
    // Record answer for current question
    const currentQuestion = activeQuestions[currentQuestionIndex];
    console.log("🚀 ~ handleNext ~ currentQuestion:", currentQuestion)
    console.log("🚀 ~ handleNext ~ userAnswers:", userAnswers)
    const isCorrect = userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer;
    console.log("🚀 ~ handleNext ~ isCorrect:", isCorrect)

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    if (currentQuestionIndex < activeQuestions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completed
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    // Shuffle questions and restart quiz
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));

    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setCorrectAnswers(0);
    setUserAnswers([]);
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Container>
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center py-8">
          <div className={cn(
            "w-full max-w-2xl mx-auto px-4",
            animate({ variant: 'fadeIn' })
          )}>
            {activeQuestions.length > 0 && !quizCompleted ? (
              <>
                <ProgressBar
                  current={currentQuestionIndex + 1}
                  total={activeQuestions.length}
                  className="mb-6"
                />

                <div className={cn(animate({ variant: 'scaleIn' }))}>
                  <QuestionCard
                    question={activeQuestions[currentQuestionIndex]}
                    onNext={handleNext}
                  />
                </div>
              </>
            ) : quizCompleted ? (
              <QuizResults
                totalQuestions={activeQuestions.length}
                correctAnswers={correctAnswers}
                onRestart={handleRestart}
              />
            ) : (
              <div className="text-center py-12">
                <p>Loading questions...</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </Container>
    </div>
  );
};

export default Index;
