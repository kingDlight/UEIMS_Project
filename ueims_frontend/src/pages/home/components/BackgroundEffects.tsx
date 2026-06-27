import React, { useEffect, useRef } from 'react';

// ─── Particle System ──────────────────────────────────────────────────────────
const Particles: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const PARTICLE_COUNT = 50;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 3 + 1;
      const left = Math.random() * 100;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 20;

      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        background: ${isDark ? 'white' : 'rgba(255, 124, 1, 0.4)'};
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
        animation: ueims-rise-fade ${duration}s linear ${delay}s infinite;
      `;
      container.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, [isDark]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export const BackgroundEffects = ({ isDark }: { isDark: boolean }) => (
  <>
    <style>{`
      @keyframes ueims-rise-fade {
        0%   { transform: translateY(100vh); opacity: 0; }
        10%  { opacity: 0.6; }
        90%  { opacity: 0.6; }
        100% { transform: translateY(-10vh); opacity: 0; }
      }
    `}</style>
    <div className={`fixed -top-40 -right-40 w-[500px] h-[500px] blur-[100px] pointer-events-none z-0 animate-drift ${isDark ? 'bg-[#f37021]/10 rounded-full' : 'bg-[#f37021]/15 animate-morph'
      }`} style={{ willChange: 'transform' }}></div>
    <div className={`fixed top-[35%] -left-40 w-[450px] h-[450px] blur-[90px] pointer-events-none z-0 animate-drift-alt ${isDark ? 'rounded-full' : 'animate-morph'
      }`} style={{ background: '#00aeff21', willChange: 'transform', animationDelay: '5s' }}></div>

    <div className={`fixed top-16 right-12 w-[400px] h-[250px] pointer-events-none z-0 rounded-2xl ${isDark ? 'bg-slate-800/20' : 'bg-white/20'} backdrop-blur-md border ${isDark ? 'border-slate-700/50' : 'border-white/50'}`} style={{
      transform: 'rotate(15deg)',
      boxShadow: '0 40px 100px -10px rgba(255, 122, 48, 0.4), 0 0 40px rgba(255, 122, 48, 0.05) inset'
    }}></div>

    <div className={`fixed bottom-12 left-12 w-[400px] h-[250px] pointer-events-none z-0 rounded-2xl ${isDark ? 'bg-slate-800/20' : 'bg-white/20'} backdrop-blur-md border ${isDark ? 'border-slate-700/50' : 'border-white/50'}`} style={{
      transform: 'rotate(-12deg)',
      boxShadow: '0 40px 100px -10px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.05) inset'
    }}></div>

    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full border-[1.5px] pointer-events-none animate-rotate-slow ${isDark ? 'border-[#f37021]/8' : 'border-[#f37021]/20'
        }`} style={{ willChange: 'transform' }}></div>
      <div className={`absolute -top-20 -left-20 w-[380px] h-[380px] rounded-full border pointer-events-none animate-rotate-slow-reverse ${isDark ? 'border-blue-500/6' : 'border-blue-400/18'
        }`} style={{ willChange: 'transform', animationDelay: '4s' }}></div>
      <div className={`absolute -bottom-28 -right-28 w-[500px] h-[500px] rounded-full border-[1.5px] pointer-events-none animate-rotate-slow-reverse ${isDark ? 'border-purple-500/6' : 'border-orange-400/15'
        }`} style={{ willChange: 'transform', animationDelay: '8s' }}></div>

      {/* Floating particles effect */}
      <Particles isDark={isDark} />
    </div>
  </>
);
