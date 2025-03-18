import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { animate } from '@/utils/animations';
import { CheckCircle, XCircle } from 'lucide-react';

interface OptionButtonProps {
  option: string;
  index: number;
  selectedIndex: number | null;
  correctIndex: number;
  isRevealed: boolean;
  onClick: () => void;
  handleReveal: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  index,
  selectedIndex,
  correctIndex,
  isRevealed,
  onClick,
  handleReveal,
}) => {
  const isSelected = selectedIndex === index;
  const isCorrect = index === correctIndex;
  
  const getVariant = () => {
    if (!isRevealed) return isSelected ? 'secondary' : 'outline';
    if (isCorrect) return 'secondary';
    if (isSelected) return 'destructive';
    return 'outline';
  };

  // Determine the right icon based on state
  const renderIcon = () => {
    if (!isRevealed) return null;
    if (isCorrect) {
      return <CheckCircle className="ml-2 h-4 w-4 text-emerald-500" />;
    }
    if (isSelected && !isCorrect) {
      return <XCircle className="ml-2 h-4 w-4 text-destructive" />;
    }
    return null;
  };

  // Dynamic styling based on state
  const getStyles = () => {
    let baseStyles = 'font-medium transition-all w-full justify-between';
    
    if (isRevealed && isCorrect) {
      baseStyles += ' text-emerald-700 dark:text-emerald-400 border-emerald-300/50 shadow-sm';
    }
    
    if (isRevealed && isSelected && !isCorrect) {
      baseStyles += ' border-destructive/50';
    }
    
    return baseStyles;
  };
  
  // Add useEffect for global keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === `${index + 1}` && !isRevealed) {
        handleReveal();
      }
    };
    
    // Add event listener to window
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [index, onClick, isRevealed]);

  return (
    <Button
      variant={getVariant() as any}
      className={cn(
        getStyles(),
        animate({ variant: 'slideUp', delay: 'short' }),
        `delay-[${100 + index * 50}ms]`
      )}
      onClick={onClick}
      disabled={isRevealed}
    >
      <span className='text-xs'>{index + 1}</span>
      <span>{option}</span>
      {renderIcon()}
    </Button>
  );
};

export default OptionButton;
