import React from 'react';

export const BackgroundEffects = ({ isDark }: { isDark: boolean }) => (
  <>
    <div className={`fixed -top-40 -right-40 w-[500px] h-[500px] blur-[100px] pointer-events-none z-0 animate-drift ${
      isDark ? 'bg-[#f37021]/10 rounded-full' : 'bg-[#f37021]/15 animate-morph'
    }`} style={{ willChange: 'transform' }}></div>
    <div className={`fixed top-[35%] -left-40 w-[450px] h-[450px] blur-[90px] pointer-events-none z-0 animate-drift-alt ${
      isDark ? 'rounded-full' : 'animate-morph'
    }`} style={{ background: '#00aeff21', willChange: 'transform', animationDelay: '5s' }}></div>

    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <svg width="100%" height="100%" className={`absolute inset-0 transition-opacity duration-300 ${
        isDark ? 'opacity-[0.04]' : 'opacity-[0.18]'
      }`}>
        <defs>
          <pattern id="hp-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#f37021" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hp-dots)" />
      </svg>
      <div className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full border-[1.5px] pointer-events-none animate-rotate-slow ${
        isDark ? 'border-[#f37021]/8' : 'border-[#f37021]/20'
      }`} style={{ willChange: 'transform' }}></div>
      <div className={`absolute -top-20 -left-20 w-[380px] h-[380px] rounded-full border pointer-events-none animate-rotate-slow-reverse ${
        isDark ? 'border-blue-500/6' : 'border-blue-400/18'
      }`} style={{ willChange: 'transform', animationDelay: '4s' }}></div>
      <div className={`absolute -bottom-28 -right-28 w-[500px] h-[500px] rounded-full border-[1.5px] pointer-events-none animate-rotate-slow-reverse ${
        isDark ? 'border-purple-500/6' : 'border-orange-400/15'
      }`} style={{ willChange: 'transform', animationDelay: '8s' }}></div>
    </div>
  </>
);
