
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { animate } from '@/utils/animations';
import { Award, BarChart3, RefreshCw } from 'lucide-react';

interface QuizResultsProps {
  totalQuestions: number;
  correctAnswers: number;
  onRestart: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ 
  totalQuestions, 
  correctAnswers, 
  onRestart 
}) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  const getPerformanceText = () => {
    if (percentage >= 90) return "Excellent work!";
    if (percentage >= 70) return "Good job!";
    if (percentage >= 50) return "Nice effort!";
    return "Keep practicing!";
  };
  
  return (
    <Card className={cn(
      "w-full max-w-md border overflow-hidden shadow-subtle mx-auto",
      animate({ variant: 'scaleIn' })
    )}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 p-2 bg-primary/10 rounded-full">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Quiz Completed!</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 text-center">
        <div className="rounded-lg bg-secondary/70 p-4 flex flex-col items-center">
          <div className="text-5xl font-bold tabular-nums text-primary">
            {percentage}%
          </div>
          <p className="text-muted-foreground mt-1">Score</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xl font-semibold">{getPerformanceText()}</p>
          <p className="text-muted-foreground">
            You got {correctAnswers} out of {totalQuestions} questions right
          </p>
        </div>
        
        <div className="pt-2 flex items-center justify-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Statistics</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-lg font-medium tabular-nums">{totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Total Questions</div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-lg font-medium tabular-nums">{correctAnswers}</div>
            <div className="text-xs text-muted-foreground">Correct Answers</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full font-medium" 
          onClick={onRestart}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizResults;
