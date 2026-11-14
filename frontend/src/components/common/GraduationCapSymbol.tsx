import React from 'react';

interface GraduationCapSymbolProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export const GraduationCapSymbol: React.FC<GraduationCapSymbolProps> = ({
  className = '',
  size = 32,
  interactive = false
}) => {
  return (
    <div 
      className={`inline-flex items-center justify-center relative transition-transform duration-300 ${
        interactive ? 'hover:scale-110 hover:-rotate-6 cursor-pointer' : ''
      } ${className}`}
      style={{ width: size, height: size }}
      title="NEXORA Career Readiness & Graduation Milestone"
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_0_12px_rgba(53,217,242,0.35)]"
      >
        {/* Cap Top Rhombus / Mortarboard */}
        <path
          d="M24 6L44 16L24 26L4 16L24 6Z"
          fill="url(#cap-gradient)"
          stroke="#35D9F2"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Skull Cap Underneath */}
        <path
          d="M12 21.5V31.5C12 36.5 17.5 40 24 40C30.5 40 36 36.5 36 31.5V21.5"
          stroke="#929CA3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Tassel String */}
        <path
          d="M38 19V32"
          stroke="#C5F45B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Tassel Fringe / Bobble */}
        <circle cx="38" cy="33" r="2" fill="#C5F45B" />
        <path
          d="M37 35L36 41M38 35L38 42M39 35L40 41"
          stroke="#C5F45B"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Center Button */}
        <ellipse cx="24" cy="16" rx="2" ry="1.2" fill="#35D9F2" />

        <defs>
          <linearGradient id="cap-gradient" x1="4" y1="6" x2="44" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#161D22" />
            <stop offset="0.5" stopColor="#11171B" />
            <stop offset="1" stopColor="#0B0F12" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
