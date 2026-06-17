import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { navLinks } from '../constants';
import { useAuthStore } from '@/stores/useAuthStore';
import { extractUserFromToken, isTokenExpired } from '@/utils/jwt';
import { LogoIcon } from '../../../components/LogoIcon';

export const NavBar = ({ isDark, toggleTheme, scrolled, scrollToSection }: { isDark: boolean, toggleTheme: () => void, scrolled: boolean, scrollToSection: (h: string) => void }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, token } = useAuthStore();

  const isReallyAuthenticated = isAuthenticated && token && !isTokenExpired(token);

  const customAvatarUrl = localStorage.getItem('ueims_custom_avatar');
  const finalAvatarUrl = customAvatarUrl || user?.avatarUrl;
  const finalFullName = user?.fullName;

  let navBgClass = 'h-20 bg-transparent';
  if (scrolled) {
    navBgClass = isDark
      ? 'h-16 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg'
      : 'h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-md';
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-12 flex items-center justify-between ${navBgClass}`}>
      <button
        type="button"
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        <LogoIcon style={{ height: '36px', width: 'auto' }} />
        <span className={`font-bold text-lg tracking-wide transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>UEIMS</span>
      </button>

      <div className="hidden md:flex items-center gap-1.5">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
            className={`text-xs font-medium px-3.5 py-2 rounded-lg transition-all duration-300 ease-in-out ${isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/40' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
          >
            {t(link.label)}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 ease-in-out bg-transparent shrink-0 ${isDark ? 'border-zinc-500 text-amber-400 hover:text-amber-300 hover:border-amber-400/50 hover:bg-zinc-800/40' : 'border-slate-400 text-slate-700 hover:text-slate-950 hover:border-slate-500 hover:bg-slate-100'
            }`}
          title={isDark ? t('common.lightMode') : t('common.darkMode')}
        >
          {isDark ? <Sun className="h-4 w-4 relative" /> : <Moon className="h-4 w-4 relative" />}
        </button>

        {!isReallyAuthenticated ? (
          <>
            <button
              onClick={() => navigate('/login')}
              className={`text-xs font-semibold bg-transparent px-4 py-2 border rounded-lg transition-all duration-300 ease-in-out ${isDark ? 'text-zinc-100 border-zinc-500 hover:text-white hover:border-[#f37021] hover:bg-[#f37021]/5' : 'text-slate-800 border-slate-400 hover:text-[#f37021] hover:border-[#f37021] hover:bg-[#f37021]/5'
                }`}
            >
              {t('home.login')}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:flex text-xs font-bold text-white px-4 py-2 rounded-lg bg-gradient-to-r from-[#f37021] to-[#e26215] shadow-lg shadow-[#f37021]/20 hover:shadow-[#f37021]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-in-out gap-1.5 items-center"
            >
              {t('home.enterSystem')}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              const payload = token ? extractUserFromToken(token) : null;
              const roles = payload?.roles || [];
              if (roles.length === 0) {
                navigate('/no-role');
              } else if (roles.includes('STUDENT') || roles.includes('ROLE_STUDENT') || roles.includes('ENTERPRISE') || roles.includes('ROLE_ENTERPRISE')) {
                navigate('/student/dashboard');
              } else {
                navigate('/training-manager/dashboard');
              }
            }}
            className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'none', border: 'none', padding: 0 }}
            title={t('home.dashboard')}
          >
            <div style={{
              width: 38, height: 38, borderRadius: '50%', color: '#fff', fontSize: 14, fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: finalAvatarUrl ? `url(${finalAvatarUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #f97316, #fb923c)',
              border: isDark ? '2px solid #3f3f46' : '2px solid #e2e8f0',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {!finalAvatarUrl && (finalFullName ? finalFullName.substring(0, 2).toUpperCase() : 'U')}
            </div>
          </button>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-1 bg-transparent transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className={`absolute top-16 left-0 right-0 p-6 flex flex-col gap-4 md:hidden shadow-xl animate-fade-in border-b transition-colors duration-300 ease-in-out ${isDark ? 'bg-[#0f1422] border-zinc-800/80' : 'bg-white border-slate-200'
          }`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
                setMenuOpen(false);
              }}
              className={`text-sm font-medium py-1 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
            >
              {t(link.label)}
            </a>
          ))}
          <button
            onClick={() => {
              if (isReallyAuthenticated) {
                const payload = token ? extractUserFromToken(token) : null;
                const roles = payload?.roles || [];
                if (roles.length === 0) {
                  navigate('/no-role');
                } else if (roles.includes('STUDENT') || roles.includes('ROLE_STUDENT') || roles.includes('ENTERPRISE') || roles.includes('ROLE_ENTERPRISE')) {
                  navigate('/student/dashboard');
                } else {
                  navigate('/training-manager/dashboard');
                }
              } else {
                navigate('/login');
              }
            }}
            className="text-sm font-bold text-white px-4 py-2.5 rounded-lg bg-[#f37021] flex justify-center items-center gap-1.5 shadow-md shadow-[#f37021]/15 mt-2"
          >
            {isReallyAuthenticated ? t('home.dashboard') : t('home.enterSystem')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </nav>
  );
};
