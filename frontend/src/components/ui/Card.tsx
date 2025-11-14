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
    default: 'bg-slate-800/60 border border-slate-600/40 backdrop-blur-sm',
    glass: 'bg-white/10 border border-white/20 backdrop-blur-md',
    gradient: 'bg-gradient-to-br from-slate-800/70 to-slate-900/70 border border-slate-600/40',
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
