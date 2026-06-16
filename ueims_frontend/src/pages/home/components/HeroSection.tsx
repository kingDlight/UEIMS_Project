import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { FloatingShapes } from './FloatingShapes';
import { useTranslation } from 'react-i18next';
import { PublicService } from '../../../services/PublicService';

export const HeroSection = ({ isDark, handleMouseMove, spotlightRef, scrollToSection }: any) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [dynamicStats, setDynamicStats] = useState([
    { value: '0', label: 'home.stats.interns' },
    { value: '0', label: 'home.stats.enterprises' },
    { value: '0%', label: 'home.stats.completion' },
    { value: '0%', label: 'home.stats.satisfaction' },
  ]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      try {
        const data = await PublicService.getHomeStats();
        if (isMounted) {
          setDynamicStats([
            { value: data.interns > 0 ? `${data.interns}+` : `${data.interns}`, label: 'home.stats.interns' },
            { value: data.enterprises > 0 ? `${data.enterprises}+` : `${data.enterprises}`, label: 'home.stats.enterprises' },
            { value: `${data.completion}%`, label: 'home.stats.completion' },
            { value: `${data.satisfaction}%`, label: 'home.stats.satisfaction' },
          ]);
        }
      } catch (error) {
        console.error('Failed to load stats', error);
      }
    };
    
    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section 
      role="presentation"
      onMouseMove={handleMouseMove}
      className={`relative pt-36 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 flex items-center justify-center overflow-hidden z-10 border-b transition-colors duration-300 ease-in-out ${
        isDark ? 'border-zinc-900' : 'border-slate-200'
      }`}
    >
      <div 
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-70 transition-opacity duration-300 ease-in-out"
        style={{
          background: `radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, -20%), ${
            isDark ? 'rgba(243, 112, 33, 0.07)' : 'rgba(243, 112, 33, 0.18)'
          }, transparent 80%)`
        }}
      ></div>

      <FloatingShapes isDark={isDark} />

      <div 
        className="max-w-6xl w-full text-center relative z-10"
      >
        <div className={`animate-fade-in-up [animation-delay:0ms] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8 transition-colors duration-300 ease-in-out ${
          isDark ? 'bg-[#f37021]/10 border-[#f37021]/30' : 'bg-[#f37021]/5 border-[#f37021]/20'
        }`}>
          <span className="flex h-2 w-2 rounded-full bg-[#f37021] animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider text-[#f37021] uppercase">{t('home.hero.ojtFpt')}</span>
        </div>

        <h1 className={`animate-fade-in-up [animation-delay:100ms] text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-6 transition-colors duration-300 ease-in-out ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {t('home.hero.title1')}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f37021] via-amber-500 to-orange-400">
            {t('home.hero.title2')}
          </span>
        </h1>

        <p className={`animate-fade-in-up [animation-delay:200ms] text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-normal transition-colors duration-300 ease-in-out ${
          isDark ? 'text-zinc-300' : 'text-slate-600'
        }`}>
          {t('home.hero.description')}
        </p>

        <div className="animate-fade-in-up [animation-delay:300ms] flex gap-4 justify-center flex-wrap mb-20">
          <button
            onClick={() => navigate('/login')}
            className="group relative overflow-hidden text-sm font-bold text-white px-7 py-3.5 rounded-full bg-gradient-to-r from-[#f37021] to-[#e26215] shadow-lg shadow-[#f37021]/30 hover:shadow-xl hover:shadow-[#f37021]/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center gap-2"
          >
            <div className="absolute top-0 -left-[100%] w-1/2 h-full block transform skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>
            <span className="relative z-10 flex items-center gap-2">{t('home.hero.startNow')}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
          <button
            onClick={() => scrollToSection('#features')}
            className={`text-sm font-semibold bg-transparent px-7 py-3.5 rounded-full border transition-all duration-300 ease-in-out ${
              isDark ? 'text-zinc-100 border-zinc-500 hover:text-white hover:bg-zinc-800/40 hover:border-zinc-400' : 'text-slate-800 border-slate-400 hover:text-[#f37021] hover:bg-slate-100 hover:border-[#f37021]'
            }`}
          >
            {t('home.hero.learnFeatures')}
          </button>
        </div>

        <div className={`animate-fade-in-up [animation-delay:400ms] grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-10 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 ease-in-out ${
          isDark ? 'border-zinc-800/30 bg-[#0e1322]/30 text-zinc-100' : 'border-slate-200 bg-white/85 shadow-lg shadow-slate-100/40 text-slate-800'
        }`}>
          {dynamicStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stat.value}
              </div>
              <div className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                {t(stat.label)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

