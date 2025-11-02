'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { logger } from '../logger';

/**
 * Optimized scroll hook with throttling and performance monitoring
 */
export const useOptimizedScroll = (
  options: {
    throttleMs?: number;
    onScroll?: (scrollY: number) => void;
    enableLogging?: boolean;
  } = {}
) => {
  const { throttleMs = 16, onScroll, enableLogging = false } = options;
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef(0);
  const scrollStartTime = useRef(0);

  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;

    const currentTime = Date.now();

    // Throttle scroll events
    if (currentTime - lastScrollTime.current < throttleMs) {
      return;
    }

    lastScrollTime.current = currentTime;

    if (!isScrolling) {
      setIsScrolling(true);
      scrollStartTime.current = currentTime;
    }

    try {
      const newScrollY = Math.max(0, window.scrollY || 0);
      setScrollY(newScrollY);

      if (onScroll && typeof onScroll === 'function') {
        onScroll(newScrollY);
      }

      if (enableLogging) {
        logger.debug('Scroll event', { scrollY: newScrollY });
      }
    } catch (error) {
      logger.error(
        'Error in scroll handler',
        error instanceof Error ? error : new Error(String(error)),
        {
          scrollY: window.scrollY,
        }
      );
    }
  }, [throttleMs, onScroll, isScrolling, enableLogging]);

  // Debounced scroll end detection
  useEffect(() => {
    if (!isScrolling) return;

    const timeoutId = setTimeout(() => {
      setIsScrolling(false);
      const scrollDuration = Date.now() - scrollStartTime.current;

      if (enableLogging) {
        logger.debug('Scroll ended', {
          duration: scrollDuration,
          finalScrollY: scrollY,
        });
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [isScrolling, scrollY, enableLogging]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Use passive event listener for better performance
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        try {
          window.removeEventListener('scroll', handleScroll);
          if (throttleRef.current) {
            clearTimeout(throttleRef.current);
            throttleRef.current = null;
          }
        } catch (error) {
          logger.warn('Error cleaning up scroll listener', {
            error: String(error),
          });
        }
      };
    } catch (error) {
      logger.error(
        'Error setting up scroll listener',
        error instanceof Error ? error : new Error(String(error))
      );
      return undefined;
    }
  }, [handleScroll, options]);

  return {
    scrollY,
    isScrolling,
  };
};

/**
 * Hook for detecting when elements are in viewport
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      logger.warn('IntersectionObserver not supported');
      return;
    }

    const element = ref.current;
    if (!element) return;

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;

          const isVisible = entry.isIntersecting;
          setIsIntersecting(isVisible);

          if (isVisible && !hasIntersected) {
            setHasIntersected(true);
          }
        },
        {
          threshold: 0.1,
          rootMargin: '0px',
          ...options,
        }
      );

      observerRef.current = observer;
      observer.observe(element);

      return () => {
        if (observerRef.current && element) {
          try {
            observerRef.current.unobserve(element);
            observerRef.current.disconnect();
          } catch (error) {
            logger.warn('Error cleaning up IntersectionObserver', {
              error: String(error),
            });
          }
        }
      };
    } catch (error) {
      logger.error(
        'Error setting up IntersectionObserver',
        error instanceof Error ? error : new Error(String(error))
      );
      return () => {
        // No cleanup needed if observer wasn't created
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.threshold, options.rootMargin, options.root, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
};

/**
 * Hook for optimized section navigation
 */
export const useSectionNavigation = (sections: string[]) => {
  const [activeSection, setActiveSection] = useState(sections[0] || '');
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const { scrollY } = useOptimizedScroll({ throttleMs: 100 });

  const registerSection = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        sectionRefs.current.set(id, element);
      } else {
        sectionRefs.current.delete(id);
      }
    },
    []
  );

  const scrollToSection = useCallback((sectionId: string) => {
    if (typeof window === 'undefined' || !sectionId) return;

    try {
      const element = sectionRefs.current.get(sectionId);
      if (!element) {
        logger.warn('Section not found', {
          sectionId,
          availableSections: Array.from(sectionRefs.current.keys()),
        });
        return;
      }

      const offsetTop = Math.max(0, element.offsetTop - 100); // Account for fixed header

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });

      logger.debug('Scrolled to section', { sectionId, offsetTop });
    } catch (error) {
      logger.error(
        'Error scrolling to section',
        error instanceof Error ? error : new Error(String(error)),
        { sectionId }
      );
    }
  }, []);

  // Update active section based on scroll position
  useEffect(() => {
    if (typeof window === 'undefined' || sections.length === 0) return;

    const findActiveSection = () => {
      try {
        const scrollPosition = Math.max(0, scrollY + 150); // Offset for better UX

        for (let i = sections.length - 1; i >= 0; i--) {
          const sectionId = sections[i];
          if (!sectionId) continue;

          const element = sectionRefs.current.get(sectionId);

          if (element && element.offsetTop <= scrollPosition) {
            if (activeSection !== sectionId) {
              setActiveSection(sectionId);
            }
            break;
          }
        }
      } catch (error) {
        logger.error(
          'Error finding active section',
          error instanceof Error ? error : new Error(String(error)),
          {
            scrollY,
          }
        );
      }
    };

    findActiveSection();
  }, [scrollY, sections, activeSection]);

  return {
    activeSection,
    registerSection,
    scrollToSection,
  };
};
