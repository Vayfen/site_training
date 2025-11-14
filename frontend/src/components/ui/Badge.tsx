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
    primary: 'bg-blue-100 text-blue-700 border border-blue-300',
    success: 'bg-green-100 text-green-700 border border-green-300',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    danger: 'bg-red-100 text-red-700 border border-red-300',
    info: 'bg-cyan-100 text-cyan-700 border border-cyan-300',
    purple: 'bg-purple-100 text-purple-700 border border-purple-300',
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
