import React from 'react';
import { LogoIcon } from '../../../components/LogoIcon';
import { useTranslation } from 'react-i18next';

export const Footer = ({ isDark, scrollToSection }: { isDark: boolean, scrollToSection: (h: string) => void }) => {
  const { t } = useTranslation('common');

  return (
    <footer className={`border-t px-6 md:px-12 py-16 relative z-10 transition-colors duration-300 ease-in-out ${isDark ? 'bg-[#070a11] border-zinc-900/60 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <LogoIcon style={{ height: '32px', width: 'auto' }} />
              <span className={`font-bold text-base tracking-wide transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>UEIMS</span>
            </div>
            <p className={`text-xs leading-relaxed max-w-sm transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              {t('home.footer.description')}
            </p>
          </div>
          <div>
            <h4 className={`font-bold text-xs tracking-wider uppercase mb-4 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{t('home.footer.system')}</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }} className="hover:text-[#f37021] transition-colors">{t('home.nav.about')}</a>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }} className="hover:text-[#f37021] transition-colors">{t('home.nav.features')}</a>
              <a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('#process'); }} className="hover:text-[#f37021] transition-colors">{t('home.nav.process')}</a>
            </div>
          </div>
          <div>
            <h4 className={`font-bold text-xs tracking-wider uppercase mb-4 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{t('home.footer.roles')}</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <a href="/login" className={`hover:text-[#f37021] transition-colors ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{t('home.footer.roleEnterprise')}</a>
              <a href="/login" className={`hover:text-[#f37021] transition-colors ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{t('home.footer.roleStudent')}</a>
              <a href="/login" className={`hover:text-[#f37021] transition-colors ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{t('home.footer.roleManager')}</a>
            </div>
          </div>
          <div>
            <h4 className={`font-bold text-xs tracking-wider uppercase mb-4 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>{t('home.footer.development')}</h4>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-start gap-2">
                <svg className={`w-4 h-4 mt-0.5 shrink-0 ${isDark ? 'text-[#f37021]' : 'text-[#f37021]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
                  <span className="font-semibold block">{t('home.footer.fpt')}</span>
                  {t('home.footer.address')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 shrink-0 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>{t('home.footer.email')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 shrink-0 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>{t('home.footer.phone')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center transition-colors duration-300 ease-in-out ${isDark ? 'border-zinc-900/40 text-zinc-500' : 'border-slate-200 text-slate-500'}`}>
          <span className="text-xs sm:text-sm">{t('home.footer.copyright')}</span>
          <span className="text-xs sm:text-sm">{t('home.footer.subtitle')}</span>
        </div>
      </div>
    </footer>
  );
};
