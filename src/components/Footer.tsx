
import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("py-6 text-center text-sm text-muted-foreground", className)}>
      <p>
        DataCamp &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
};

export default Footer;
