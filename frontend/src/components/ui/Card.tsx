import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  onClick,
}) => {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300';

  const variants = {
    default: 'bg-slate-800/80 border border-slate-600/60 backdrop-blur-sm shadow-xl',
    glass: 'bg-white/15 border border-white/30 backdrop-blur-lg shadow-2xl',
    gradient: 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/60 shadow-2xl',
  };

  const hoverStyles = hover ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:border-blue-500/50' : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
