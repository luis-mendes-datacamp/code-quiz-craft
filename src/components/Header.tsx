
import React from 'react';
import { Code, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { animate } from '@/utils/animations';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn(
      "flex items-center justify-center py-8", 
      animate({ variant: 'fadeIn' }),
      className
    )}>
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Code className="h-6 w-6 text-primary" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            DataCamp
          </h1>
          <p className="text-sm text-muted-foreground">
            Test your Python knowledge
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
