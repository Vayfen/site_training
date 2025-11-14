import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';

  const variants = {
    primary: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
    success: 'bg-green-600/20 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-600/20 text-red-400 border border-red-500/30',
    info: 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30',
    purple: 'bg-purple-600/20 text-purple-400 border border-purple-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
