import React, { useState } from 'react';
import { features } from '../constants';

export const FeaturesSection = ({ isDark }: { isDark: boolean }) => (
  <section id="features" className={`py-20 md:py-28 px-6 md:px-12 relative z-10 border-b scroll-mt-20 transition-colors duration-300 ease-in-out ${isDark ? 'border-zinc-900 bg-[#0e1322]/20' : 'border-slate-200 bg-white'}`}>
    <div
      className="max-w-6xl mx-auto"
    >
      <div className="scroll-animate transition-all duration-700 ease-out text-center mb-16 md:mb-20">
        <span className="text-xs font-bold tracking-widest text-[#f37021] uppercase">Tính Năng Cốt Lõi</span>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 mb-4 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Quản lý thực tập chuyên nghiệp
        </h2>
        <p className={`text-sm sm:text-base max-w-xl mx-auto transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          Thiết kế giải pháp phù hợp cho tất cả các đối tượng tham gia vào kỳ học doanh nghiệp OJT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title} className={`scroll-animate transition-all duration-700 ease-out border rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 ease-in-out group ${isDark ? 'bg-[#101524] border-zinc-800/50 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50'}`}
            >
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-6 group-hover:scale-105 transition-transform`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-100 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-900'}`}>
                {feat.title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed font-normal transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
