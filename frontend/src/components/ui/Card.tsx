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
    default: 'bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm',
    glass: 'bg-white/5 border border-white/10 backdrop-blur-md',
    gradient: 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50',
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
