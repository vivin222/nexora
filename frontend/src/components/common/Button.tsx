import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] font-sans';
  
  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  const variants = {
    primary:
      'bg-[#35D9F2] hover:bg-[#2bc4dc] text-[#050608] font-semibold shadow-[0_0_20px_rgba(53,217,242,0.3)] hover:shadow-[0_0_28px_rgba(53,217,242,0.45)] border border-[#35D9F2]/40',
    lime:
      'bg-[#C5F45B] hover:bg-[#b5e648] text-[#050608] font-semibold shadow-[0_0_20px_rgba(197,244,91,0.3)] hover:shadow-[0_0_28px_rgba(197,244,91,0.45)] border border-[#C5F45B]/40',
    secondary:
      'bg-[#11171B] hover:bg-[#161D22] text-[#F5F7F4] border border-white/10 hover:border-white/20',
    outline:
      'bg-transparent hover:bg-white/5 text-[#F5F7F4] border border-white/15 hover:border-white/30',
    ghost:
      'bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// Aliased export for compatibility with existing code
export const CrimsonButton = Button;
