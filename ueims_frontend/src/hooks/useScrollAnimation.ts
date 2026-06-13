import { useEffect } from 'react';

export const useScrollAnimation = () => {
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
