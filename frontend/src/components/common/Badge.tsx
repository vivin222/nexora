import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'lime' | 'neutral' | 'outline' | 'amber' | 'crimson';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  className = '',
}) => {
  const base = 'inline-flex items-center font-mono font-medium rounded-full transition-colors tracking-tight select-none';
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variants = {
    cyan: 'bg-[#35D9F2]/10 text-[#35D9F2] border border-[#35D9F2]/30 shadow-[0_0_12px_rgba(53,217,242,0.18)]',
    lime: 'bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/30 shadow-[0_0_12px_rgba(197,244,91,0.18)]',
    neutral: 'bg-white/5 text-zinc-300 border border-white/10',
    outline: 'bg-transparent text-zinc-400 border border-white/10',
    amber: 'bg-amber-400/10 text-amber-300 border border-amber-400/30',
    crimson: 'bg-[#35D9F2]/10 text-[#35D9F2] border border-[#35D9F2]/30 shadow-[0_0_12px_rgba(53,217,242,0.18)]',
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
