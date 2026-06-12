import React, { useState, useEffect, useCallback } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { NavBar } from './components/NavBar';
import { HeroSection } from './components/HeroSection';

const AboutSection = React.lazy(() => import('./components/AboutSection').then(m => ({ default: m.AboutSection })));
const FeaturesSection = React.lazy(() => import('./components/FeaturesSection').then(m => ({ default: m.FeaturesSection })));
const ProcessSection = React.lazy(() => import('./components/ProcessSection').then(m => ({ default: m.ProcessSection })));
const PartnerSection = React.lazy(() => import('./components/PartnerSection').then(m => ({ default: m.PartnerSection })));
const CTASection = React.lazy(() => import('./components/CTASection').then(m => ({ default: m.CTASection })));
const Footer = React.lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));

const FallbackLoader = ({ minHeight = "50vh" }: { minHeight?: string }) => (
  <div style={{ minHeight }} className="flex items-center justify-center w-full">
    <div className="w-8 h-8 border-4 border-[#f37021]/30 border-t-[#f37021] rounded-full animate-spin"></div>
  </div>
);
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

    let debounceTimer: ReturnType<typeof setTimeout>;
    const debouncedObserveAll = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(observeAll, 200);
    };

    observeAll();
    const timeout = setTimeout(observeAll, 100);

    const mutationObserver = new MutationObserver(() => {
      debouncedObserveAll();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(debounceTimer);
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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((href: string) => {
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
  }, []);

  const themeTimeoutRef = React.useRef<any>(null);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.add('theme-transitioning');
    setIsDark(prev => !prev);
    if (themeTimeoutRef.current) clearTimeout(themeTimeoutRef.current);
    themeTimeoutRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 700);
  }, []);

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

      <React.Suspense fallback={<FallbackLoader />}>
        <AboutSection isDark={isDark} />
      </React.Suspense>
      <React.Suspense fallback={<FallbackLoader />}>
        <FeaturesSection isDark={isDark} />
      </React.Suspense>
      <React.Suspense fallback={<FallbackLoader />}>
        <ProcessSection isDark={isDark} />
      </React.Suspense>
      <React.Suspense fallback={<FallbackLoader />}>
        <PartnerSection isDark={isDark} />
      </React.Suspense>
      <React.Suspense fallback={<FallbackLoader />}>
        <CTASection isDark={isDark} />
      </React.Suspense>
      <React.Suspense fallback={<FallbackLoader minHeight="20vh" />}>
        <Footer isDark={isDark} scrollToSection={scrollToSection} />
      </React.Suspense>
    </div>
  );
};
