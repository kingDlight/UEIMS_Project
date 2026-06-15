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
            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              <span className={isDark ? 'text-zinc-450' : 'text-slate-600'}>{t('home.footer.fpt')}</span>
              <span className={isDark ? 'text-zinc-450' : 'text-slate-600'}>{t('home.footer.group')}</span>
              <span className="text-[#f37021]">OJT 2026</span>
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
