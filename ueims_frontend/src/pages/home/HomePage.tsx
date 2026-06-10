import React, { useState, useEffect } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { NavBar } from './components/NavBar';
import { HeroSection } from './components/HeroSection';

const AboutSection = React.lazy(() => import('./components/AboutSection').then(m => ({ default: m.AboutSection })));
const FeaturesSection = React.lazy(() => import('./components/FeaturesSection').then(m => ({ default: m.FeaturesSection })));
const ProcessSection = React.lazy(() => import('./components/ProcessSection').then(m => ({ default: m.ProcessSection })));
const PartnerSection = React.lazy(() => import('./components/PartnerSection').then(m => ({ default: m.PartnerSection })));
const CTASection = React.lazy(() => import('./components/CTASection').then(m => ({ default: m.CTASection })));
const Footer = React.lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));

const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            (entry.target as HTMLElement).dataset.animated = 'true';
            if ((entry.target as HTMLElement).dataset.once !== 'false') {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    const observedElements = new WeakSet();

    const observeAll = () => {
      document.querySelectorAll('.scroll-animate').forEach((el) => {
        if (!observedElements.has(el)) {
          observedElements.add(el);
          observer.observe(el);
        }
      });
    };

    observeAll();
    const timeout = setTimeout(observeAll, 100);

    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
};

export const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  useScrollAnimation();
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('homepage-theme');
    return saved === null ? true : JSON.parse(saved);
  });
  const spotlightRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlightRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    spotlightRef.current.style.setProperty('--mouse-x', `${x}px`);
    spotlightRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  useEffect(() => {
    localStorage.setItem('homepage-theme', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      try {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        console.warn('Smooth scroll fallback', err);
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + (window.pageYOffset || window.scrollY);
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
      }
    }
  };

  const themeTimeoutRef = React.useRef<any>(null);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    setIsDark(!isDark);
    if (themeTimeoutRef.current) clearTimeout(themeTimeoutRef.current);
    themeTimeoutRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 700);
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-[#f37021]/30 selection:text-white overflow-x-hidden transition-colors duration-300 ease-in-out ${
      isDark ? 'bg-[#0b0f19] text-zinc-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <style>{`
        .theme-transitioning * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow !important;
          transition-duration: 0.7s !important;
          transition-timing-function: ease-in-out !important;
        }
      `}</style>
      
      <BackgroundEffects isDark={isDark} />
      
      <NavBar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        scrolled={scrolled} 
        scrollToSection={scrollToSection} 
      />

      <HeroSection 
        isDark={isDark} 
        handleMouseMove={handleMouseMove} 
        spotlightRef={spotlightRef} 
        scrollToSection={scrollToSection} 
      />

      <React.Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#f37021]/30 border-t-[#f37021] rounded-full animate-spin"></div></div>}>
        <AboutSection isDark={isDark} />
        <FeaturesSection isDark={isDark} />
        <ProcessSection isDark={isDark} />
        <PartnerSection isDark={isDark} />
        <CTASection isDark={isDark} />
        <Footer isDark={isDark} scrollToSection={scrollToSection} />
      </React.Suspense>
    </div>
  );
};
