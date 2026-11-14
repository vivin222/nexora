import React, { useState, useEffect, useRef } from 'react';
import { GraduationCapSymbol } from './GraduationCapSymbol';

interface FloatingElement {
  id: string;
  type: 'letter' | 'icon' | 'shape' | 'cap';
  content: string | React.ReactNode;
  initialX: number; // percentage (0-100)
  initialY: number; // percentage (0-100)
  speed: number;    // parallax multiplier (e.g. 15 to 45)
  rotateFactor: number;
  color?: string;
  glow?: string;
  size?: string;
}

export const CursorInteractiveSystem: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Mouse movement listener
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to -1 to +1 relative to viewport center
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      targetPos.current = { x: normX, y: normY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth physics damping loop via lerp
    const updatePhysics = () => {
      const lerpFactor = 0.06;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerpFactor;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerpFactor;

      setMousePos({
        x: currentPos.current.x,
        y: currentPos.current.y
      });

      animationFrameId.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameId.current = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [reducedMotion]);

  // Coordinated System of Small, Lightweight Interactive Elements
  const elements: FloatingElement[] = [
    // 1. Typographic Code & Math Fragments
    { id: 'glyph-1', type: 'letter', content: '{}', initialX: 8, initialY: 18, speed: 28, rotateFactor: 6, color: '#35D9F2' },
    { id: 'glyph-2', type: 'letter', content: '</>', initialX: 92, initialY: 24, speed: 32, rotateFactor: -8, color: '#C5F45B' },
    { id: 'glyph-3', type: 'letter', content: 'λ', initialX: 14, initialY: 72, speed: 20, rotateFactor: 4, color: '#929CA3' },
    { id: 'glyph-4', type: 'letter', content: '=>', initialX: 86, initialY: 68, speed: 25, rotateFactor: -5, color: '#35D9F2' },
    { id: 'glyph-5', type: 'letter', content: 'async', initialX: 22, initialY: 42, speed: 18, rotateFactor: 3, color: '#929CA3', size: 'text-[10px]' },
    { id: 'glyph-6', type: 'letter', content: 'AI', initialX: 78, initialY: 38, speed: 36, rotateFactor: -7, color: '#C5F45B', size: 'text-xs' },
    
    // 2. Small Domain SVG Skill Icons (Code, Cloud, Cyber, Data, Neural)
    {
      id: 'icon-neural',
      type: 'icon',
      content: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#35D9F2] fill-none" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" fill="#35D9F2" fillOpacity="0.2" />
          <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M18.4 5.6l-4.2 4.2M9.8 14.2l-4.2 4.2" strokeLinecap="round" />
        </svg>
      ),
      initialX: 18,
      initialY: 28,
      speed: 34,
      rotateFactor: 8
    },
    {
      id: 'icon-cloud',
      type: 'icon',
      content: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-[#929CA3] fill-none" strokeWidth="1.5">
          <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z" strokeLinejoin="round" />
        </svg>
      ),
      initialX: 82,
      initialY: 80,
      speed: 22,
      rotateFactor: -4
    },
    {
      id: 'icon-shield',
      type: 'icon',
      content: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-[#C5F45B] fill-none" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      initialX: 10,
      initialY: 55,
      speed: 26,
      rotateFactor: 5
    },
    {
      id: 'icon-database',
      type: 'icon',
      content: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-[#35D9F2] fill-none" strokeWidth="1.5">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
      initialX: 90,
      initialY: 50,
      speed: 30,
      rotateFactor: -6
    },

    // 3. Subtle Floating Growth Elements (Diamond, Node, Micro-Rings)
    {
      id: 'shape-diamond',
      type: 'shape',
      content: <div className="w-2.5 h-2.5 rotate-45 border border-[#35D9F2]/40 bg-[#35D9F2]/10" />,
      initialX: 30,
      initialY: 82,
      speed: 16,
      rotateFactor: 9
    },
    {
      id: 'shape-ring',
      type: 'shape',
      content: <div className="w-4 h-4 rounded-full border border-dashed border-[#C5F45B]/30" />,
      initialX: 72,
      initialY: 15,
      speed: 24,
      rotateFactor: -10
    },

    // 4. Graduation Cap Identity (subtle mouse response, aspirational symbol)
    {
      id: 'cap-hero',
      type: 'cap',
      content: <GraduationCapSymbol size={28} interactive={false} />,
      initialX: 88,
      initialY: 14,
      speed: 40,
      rotateFactor: -8
    }
  ];

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none"
      aria-hidden="true"
    >
      {elements.map((el) => {
        // Calculate dynamic parallax offset
        const offsetX = reducedMotion ? 0 : mousePos.x * el.speed;
        const offsetY = reducedMotion ? 0 : mousePos.y * el.speed;
        const rotation = reducedMotion ? 0 : mousePos.x * el.rotateFactor;

        return (
          <div
            key={el.id}
            className="absolute transition-transform duration-75 ease-out flex items-center justify-center opacity-40 hover:opacity-80"
            style={{
              left: `${el.initialX}%`,
              top: `${el.initialY}%`,
              transform: `translate3d(${offsetX}px, ${offsetY}px, 0px) rotate(${rotation}deg)`
            }}
          >
            {el.type === 'letter' && (
              <span 
                className={`font-mono font-bold ${el.size || 'text-sm'} tracking-wider`}
                style={{ color: el.color }}
              >
                {el.content}
              </span>
            )}

            {el.type === 'icon' && (
              <div className="p-1.5 rounded-lg bg-[#11171B]/60 border border-white/5 backdrop-blur-xs">
                {el.content}
              </div>
            )}

            {el.type === 'shape' && el.content}

            {el.type === 'cap' && (
              <div className="opacity-70 hover:opacity-100 transition-opacity">
                {el.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
