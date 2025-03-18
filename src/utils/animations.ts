
import { cn } from '@/lib/utils';

export const ANIMATION_VARIANTS = {
  // Fade animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  
  // Slide animations
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  
  // Scale animations
  scaleIn: 'animate-scale-in',
  
  // Special animations
  pulseSubtle: 'animate-pulse-subtle',
  float: 'animate-float',
};

export type AnimationVariant = keyof typeof ANIMATION_VARIANTS;

interface AnimateProps {
  variant: AnimationVariant;
  className?: string;
  delay?: 'short' | 'medium' | 'long';
}

// Helper function to apply animation classes with optional delay
export const animate = ({ variant, className = '', delay }: AnimateProps): string => {
  const animationClass = ANIMATION_VARIANTS[variant];
  
  let delayClass = '';
  if (delay === 'short') delayClass = 'delay-100';
  if (delay === 'medium') delayClass = 'delay-300';
  if (delay === 'long') delayClass = 'delay-500';
  
  return cn(animationClass, delayClass, className);
};

// Helper function to generate staggered animation delays for lists
export const staggeredDelay = (index: number, baseDelay: number = 50): string => {
  return `transition-all duration-300 delay-[${index * baseDelay}ms]`;
};
