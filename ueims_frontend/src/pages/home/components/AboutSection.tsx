import React from 'react';
import { useTranslation } from 'react-i18next';

export const AboutSection = ({ isDark }: { isDark: boolean }) => {
  const { t } = useTranslation();
  return (
  <section id="about" className={`py-20 md:py-28 px-6 md:px-12 relative z-10 border-b scroll-mt-20 transition-colors duration-300 ease-in-out ${
    isDark ? 'border-zinc-900 bg-[#070a11]/40' : 'border-slate-200 bg-slate-50/50'
  }`}>
    <div
      className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center"
    >
      <div className="scroll-animate transition-all duration-700 ease-out flex-1">
        <span className="text-xs font-bold tracking-widest text-[#f37021] uppercase">{t('home.aboutSection.subtitle')}</span>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 mb-6 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('home.aboutSection.title')}
        </h2>
        <p className={`text-sm sm:text-base leading-relaxed mb-6 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          {t('home.aboutSection.p1')}
        </p>
        <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          {t('home.aboutSection.p2')}
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        {[
          { num: '01', title: t('home.aboutSection.items.i1.title'), desc: t('home.aboutSection.items.i1.desc'), colorClass: isDark ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600' },
          { num: '02', title: t('home.aboutSection.items.i2.title'), desc: t('home.aboutSection.items.i2.desc'), colorClass: isDark ? 'bg-[#f37021]/10 text-[#f37021]' : 'bg-orange-50 text-[#f37021]' },
          { num: '03', title: t('home.aboutSection.items.i3.title'), desc: t('home.aboutSection.items.i3.desc'), colorClass: isDark ? 'bg-emerald-600/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600' },
          { num: '04', title: t('home.aboutSection.items.i4.title'), desc: t('home.aboutSection.items.i4.desc'), colorClass: isDark ? 'bg-purple-600/10 text-purple-400' : 'bg-purple-50 text-purple-600' }
        ].map((item) => (
          <div key={item.title} className={`scroll-animate transition-all duration-700 ease-out border p-6 rounded-2xl transition-all duration-300 ease-in-out ${isDark ? 'bg-[#101524]/60 border-zinc-800/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-4 font-semibold text-sm ${item.colorClass}`}>{item.num}</div>
            <h4 className={`text-sm font-bold mb-2 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{item.title}</h4>
            <p className={`text-xs leading-relaxed transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};
