/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CodeBlock from '@/components/CodeBlock';
import OptionButton from '@/components/OptionButton';
import { Question } from '@/data/questions';
import { cn } from '@/lib/utils';
import { animate } from '@/utils/animations';
import { ArrowRight, Check, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CodeBlock as WafflesCodeBlock } from '@datacamp/waffles/code-block';
import {darkThemeStyle, theme} from "@datacamp/waffles/theme";
import {css} from '@emotion/react';

interface QuestionCardProps {
  question: Question;
  onNext: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const handleSelectOption = (index: number) => {
    if (isRevealed) return;
    setSelectedOption(index);
  };
  
  const handleReveal = () => {
    setIsRevealed(true);
  };
  
  const handleNext = () => {
    setSelectedOption(null);
    setIsRevealed(false);
    onNext();
  };
  
  const handleReset = () => {
    setSelectedOption(null);
    setIsRevealed(false);
  };

  const difficultyColor = {
    beginner: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    intermediate: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    expert: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
  };

  const handleSubmitAnswer = (e: KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '4') {
      setSelectedOption(Number(e.key) - 1);
      setIsRevealed(true);
    }
  };

  useEffect(() => {
    // add event listener to the document for keydown
    document.addEventListener('keydown', handleSubmitAnswer);
    return () => {
      document.removeEventListener('keydown', handleSubmitAnswer);
    };
  }, []);
  
  

  return (
    <Card className={cn(
      "w-full max-w-2xl border overflow-hidden shadow-subtle",
      animate({ variant: 'scaleIn' })
    )}>
      <CardHeader className="pb-2 flex-row justify-between items-center">
        <Badge 
          variant="outline" 
          className={cn("font-medium capitalize", difficultyColor[question.difficultyLevel])}
        >
          {question.difficultyLevel}
        </Badge>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleReset} title="Reset Question">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Fill in the blank:</h3>
          <CodeBlock code={question.question.code} />
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Output:</h3>
          <WafflesCodeBlock size="medium" css={{backgroundColor: theme.background.contrastInverse, color: theme.text.inverse}}>{question.question.output}</WafflesCodeBlock>
          {isRevealed && (
            <div className={cn(
              "mt-4 bg-secondary/50 rounded-lg p-3 text-sm",
              animate({ variant: 'fadeIn' })
            )}>
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground">{question.question.explanation}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2 mt-6">
          {question.options.map((option, idx) => (
            <OptionButton
              key={idx}
              option={option}
              index={idx}
              selectedIndex={selectedOption}
              correctIndex={question.correctAnswer}
              isRevealed={isRevealed}
              onClick={() => handleSelectOption(idx)}
            />
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        {!isRevealed ? (
          <Button 
            onClick={handleReveal} 
            disabled={selectedOption === null}
            className={cn("font-medium", animate({ variant: 'fadeIn' }))}
          >
            Check Answer
            <Check className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            className={cn("font-medium", animate({ variant: 'fadeIn' }))}
          >
            Next Question
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
