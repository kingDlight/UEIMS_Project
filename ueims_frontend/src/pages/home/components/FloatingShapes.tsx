import React, { useState } from 'react';

export const FloatingShapes = ({ isDark }: { isDark: boolean }) => (
  <>
    <div className="absolute top-[20%] left-[8%] w-12 h-12 rounded-full animate-float pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(243, 112, 33, 0.18)' : '1px solid rgba(243, 112, 33, 0.35)', willChange: 'transform' }}></div>
    <div className="absolute bottom-[15%] right-[8%] w-16 h-16 rounded-xl rotate-45 animate-float pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(59, 130, 246, 0.18)' : '1px solid rgba(96, 165, 250, 0.40)', animationDelay: '1.5s', animationDuration: '8s', willChange: 'transform' }}></div>
    <div className={`absolute top-[35%] right-[12%] w-8 h-8 rounded-full animate-float pointer-events-none z-0 ${
      isDark ? 'bg-amber-500/6' : 'bg-orange-400/20'
    }`} style={{ animationDelay: '3s', animationDuration: '7s', willChange: 'transform' }}></div>
    <div className="absolute bottom-[30%] left-[12%] w-20 h-20 rounded-full animate-float pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(113, 113, 122, 0.12)' : '1px solid rgba(148, 163, 184, 0.25)', animationDelay: '4.5s', animationDuration: '9s', willChange: 'transform' }}></div>
    
    <div className={`absolute top-[55%] left-[5%] w-5 h-5 rounded-full animate-particle pointer-events-none z-0 ${
      isDark ? 'bg-[#f37021]/20' : 'bg-[#f37021]/40'
    }`} style={{ animationDelay: '0.5s', willChange: 'transform' }}></div>
    <div className={`absolute top-[18%] right-[22%] w-3 h-3 rounded-full animate-particle pointer-events-none z-0 ${
      isDark ? 'bg-blue-400/25' : 'bg-blue-500/50'
    }`} style={{ animationDelay: '2s', willChange: 'transform' }}></div>
    <div className={`absolute bottom-[20%] right-[30%] w-4 h-4 rounded-full animate-particle pointer-events-none z-0 ${
      isDark ? 'bg-amber-400/18' : 'bg-amber-500/40'
    }`} style={{ animationDelay: '3.5s', willChange: 'transform' }}></div>
    <div className={`absolute top-[42%] left-[30%] w-2.5 h-2.5 rounded-full animate-particle pointer-events-none z-0 ${
      isDark ? 'bg-purple-400/20' : 'bg-purple-500/45'
    }`} style={{ animationDelay: '5s', willChange: 'transform' }}></div>
    
    <div className="absolute top-[10%] left-[35%] w-6 h-6 rotate-45 animate-rotate-slow pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(243, 112, 33, 0.3)' : '1px solid rgba(243, 112, 33, 0.6)', willChange: 'transform' }}></div>
    <div className="absolute bottom-[8%] right-[18%] w-8 h-8 rotate-12 animate-rotate-slow-reverse pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.4)', willChange: 'transform', animationDelay: '3s' }}></div>
    
    <div className="absolute top-[25%] right-[15%] w-16 h-16 rounded-2xl animate-float pointer-events-none z-20"
         style={{ border: isDark ? '2px solid rgba(243, 112, 33, 0.5)' : '2px solid rgba(243, 112, 33, 0.8)', animationDelay: '2.5s', animationDuration: '8.5s', willChange: 'transform' }}></div>
    <div className="absolute top-[65%] left-[20%] w-12 h-12 rounded-xl animate-float pointer-events-none z-20"
         style={{ border: isDark ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(59, 130, 246, 0.8)', animationDelay: '4s', animationDuration: '6s', willChange: 'transform' }}></div>
  </>
);
