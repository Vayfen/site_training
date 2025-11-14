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
    default: 'bg-white border border-gray-200 shadow-lg',
    glass: 'bg-white/70 border border-white/40 backdrop-blur-xl shadow-2xl',
    gradient: 'bg-gradient-to-br from-white to-blue-50/30 border border-gray-200 shadow-xl',
  };

  const hoverStyles = hover ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:border-blue-400' : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
