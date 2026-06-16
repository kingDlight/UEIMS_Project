import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PartnerSection = ({ isDark }: { isDark: boolean }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <section id="partner" className={`py-20 md:py-28 px-6 md:px-12 relative z-10 border-b scroll-mt-20 transition-colors duration-300 ease-in-out ${isDark ? 'bg-[#0e1322]/20 border-zinc-900' : 'bg-slate-50 border-slate-200'}`}>
      <div
        className={`scroll-animate transition-all duration-700 ease-out max-w-5xl mx-auto border rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center transition-colors duration-300 ease-in-out ${isDark ? 'bg-[#101524] border-zinc-800/80' : 'bg-white border-slate-200'}`}
      >
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full"></div>
        <div className="flex-1 z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#f37021] bg-[#f37021]/10 px-2.5 py-1 rounded-md">
            {t('home.partnerSection.tag')}
          </span>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold mt-5 mb-4 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('home.partnerSection.title')}
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed max-w-lg mb-0 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
            {t('home.partnerSection.description')}
          </p>
        </div>
        <div className="flex flex-col gap-3 shrink-0 z-10 w-full md:w-auto">
          <button
            onClick={() => navigate('/register-enterprise')}
            className="text-xs font-bold text-white px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#f37021] to-[#e26215] shadow-lg shadow-[#f37021]/15 hover:shadow-[#f37021]/30 hover:-translate-y-0.5 active:translate-y-0 text-center transition-all duration-300 ease-in-out"
          >
            {t('home.partnerSection.registerBtn')}
          </button>
          <button
            onClick={() => navigate('/login')}
            className={`text-xs font-semibold bg-transparent px-6 py-3.5 rounded-xl border text-center transition-all duration-300 ease-in-out ${isDark ? 'text-zinc-100 border-zinc-500 hover:text-white hover:border-[#f37021] hover:bg-[#f37021]/5' : 'text-slate-800 border-slate-400 hover:text-[#f37021] hover:border-[#f37021] hover:bg-[#f37021]/5'}`}
          >
            {t('home.partnerSection.supportBtn')}
          </button>
        </div>
      </div>
    </section>
  );
};
