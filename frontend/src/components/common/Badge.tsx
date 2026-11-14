import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'crimson' | 'neutral' | 'emerald' | 'amber' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'crimson',
  size = 'md',
  className = '',
}) => {
  const base = 'inline-flex items-center font-medium rounded-full transition-colors';
  const sizes = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  const variants = {
    crimson: 'bg-rose-950/60 text-rose-300 border border-rose-800/50 shadow-[0_0_12px_rgba(225,29,72,0.2)]',
    neutral: 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60',
    emerald: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50',
    amber: 'bg-amber-950/60 text-amber-300 border border-amber-800/50',
    outline: 'bg-transparent text-zinc-300 border border-zinc-700',
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
