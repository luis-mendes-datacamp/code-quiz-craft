
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Difficulty = 'all' | 'beginner' | 'intermediate' | 'expert';

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
  selectedDifficulty, 
  onChange 
}) => {
  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {difficulties.map((difficulty) => (
        <Button
          key={difficulty.value}
          variant={selectedDifficulty === difficulty.value ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => onChange(difficulty.value)}
          className={cn(
            "font-medium transition-all",
            selectedDifficulty === difficulty.value && "shadow-sm"
          )}
        >
          {difficulty.label}
        </Button>
      ))}
    </div>
  );
};

export default DifficultySelector;
