import React from 'react';
import { useScrollAnimation } from '../utils/useScrollAnimation';

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn';
  delay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  className = '',
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
}) => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const getAnimationStyles = () => {
    const baseStyles = {
      transition: `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
      opacity: isVisible ? 1 : 0,
    };

    switch (animation) {
      case 'fadeIn':
        return {
          ...baseStyles,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        };
      case 'slideUp':
        return {
          ...baseStyles,
          transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        };
      case 'slideLeft':
        return {
          ...baseStyles,
          transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
        };
      case 'slideRight':
        return {
          ...baseStyles,
          transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
        };
      case 'scaleIn':
        return {
          ...baseStyles,
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        };
      case 'bounceIn':
        return {
          ...baseStyles,
          transform: isVisible ? 'scale(1)' : 'scale(0.3)',
          transition: `all ${duration}s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}s`,
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div ref={elementRef} className={className} style={getAnimationStyles()}>
      {children}
    </div>
  );
};

export default AnimatedElement; 