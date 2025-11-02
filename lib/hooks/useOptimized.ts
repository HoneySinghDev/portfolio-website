'use client';

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { logger, trackPerformance } from '../logger';

/**
 * Hook for performance-optimized animations with RAF
 */
export const useOptimizedAnimation = (
  callback: (timestamp: number) => void,
  deps: ReadonlyArray<unknown> = []
) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const isActiveRef = useRef(false);

  const animate = useCallback(
    (timestamp: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = timestamp - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = timestamp;

      if (isActiveRef.current) {
        requestRef.current = requestAnimationFrame(animate);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, ...deps]
  );

  const startAnimation = useCallback(() => {
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const stopAnimation = useCallback(() => {
    isActiveRef.current = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return { startAnimation, stopAnimation, isActive: isActiveRef.current };
};

/**
 * Hook for debounced values
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttled values
 */
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Hook for memoized expensive calculations
 */
export const useMemoizedCalculation = <T>(
  calculation: () => T,
  deps: ReadonlyArray<unknown>,
  options: {
    maxAge?: number; // Cache invalidation in ms
    enableLogging?: boolean;
  } = {}
) => {
  const { maxAge = 5000, enableLogging = false } = options;
  const cacheRef = useRef<{ value: T; timestamp: number } | null>(null);

  return useMemo(() => {
    const now = Date.now();

    // Check if cache is valid
    if (cacheRef.current && now - cacheRef.current.timestamp < maxAge) {
      if (enableLogging) {
        logger.debug('Using cached calculation result');
      }
      return cacheRef.current.value;
    }

    // Perform calculation
    const startTime = performance.now();
    const result = calculation();

    if (enableLogging) {
      trackPerformance('Memoized calculation', startTime, {
        cacheAge: cacheRef.current ? now - cacheRef.current.timestamp : 'N/A',
      });
    }

    // Cache the result
    cacheRef.current = {
      value: result,
      timestamp: now,
    };

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculation, enableLogging, maxAge, ...deps]);
};

/**
 * Hook for lazy loading with intersection observer
 */
export const useLazyLoad = (
  options: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
) => {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          if (!isLoaded) {
            setIsLoaded(true);
          }
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, isLoaded]);

  return { ref, isLoaded, isInView };
};

/**
 * Hook for optimized image loading
 */
export const useOptimizedImage = (
  src: string,
  options: {
    placeholder?: string;
    fallback?: string;
    enableLogging?: boolean;
    timeout?: number;
  } = {}
) => {
  const {
    placeholder,
    fallback,
    enableLogging = false,
    timeout = 10000,
  } = options;
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  );
  const [currentSrc, setCurrentSrc] = useState(placeholder || src || '');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!src || typeof src !== 'string' || src.trim().length === 0) {
      setImageState('error');
      setCurrentSrc(fallback || placeholder || '');
      return;
    }

    setImageState('loading');
    setCurrentSrc(placeholder || src);

    const img = new Image();
    let isMounted = true;

    const handleLoad = () => {
      if (!isMounted) return;
      clearTimeoutIfExists();
      setImageState('loaded');
      setCurrentSrc(src);
      if (enableLogging) {
        logger.debug('Image loaded successfully', { src });
      }
    };

    const handleError = () => {
      if (!isMounted) return;
      clearTimeoutIfExists();
      setImageState('error');
      if (fallback) {
        setCurrentSrc(fallback);
      } else {
        setCurrentSrc(placeholder || '');
      }
      if (enableLogging) {
        logger.warn('Image failed to load', { src, fallback });
      }
    };

    const clearTimeoutIfExists = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    timeoutRef.current = setTimeout(() => {
      if (isMounted && imageState === 'loading') {
        handleError();
        if (enableLogging) {
          logger.warn('Image load timeout', { src, timeout });
        }
      }
    }, timeout);

    try {
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = src;
    } catch (error) {
      logger.error(
        'Error setting up image load',
        error instanceof Error ? error : new Error(String(error)),
        { src }
      );
      handleError();
    }

    return () => {
      isMounted = false;
      clearTimeoutIfExists();
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder, fallback, enableLogging, timeout, imageState]);

  return {
    src: currentSrc,
    state: imageState,
    isLoading: imageState === 'loading',
    isLoaded: imageState === 'loaded',
    hasError: imageState === 'error',
  };
};

/**
 * Hook for measuring component performance
 * Optimized to reduce overhead - only logs in development and throttles warnings
 */
export const usePerformanceMeasure = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const lastWarningTime = useRef<number>(0);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Throttle warnings to once per second to reduce console spam
  const WARNING_THROTTLE_MS = 1000;

  useEffect(() => {
    if (typeof performance === 'undefined') return;

    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      if (typeof performance === 'undefined') return;

      const renderTime = performance.now() - renderStartTime.current;
      const now = Date.now();

      // Only log in development and throttle warnings
      if (isDevelopment) {
        // Debug logs only for very slow renders (>200ms) or every 10th render
        if (renderTime > 200 || renderCount.current % 10 === 0) {
          logger.debug(`Component render performance`, {
            component: componentName || 'Unknown',
            renderTime: `${renderTime.toFixed(2)}ms`,
            renderCount: renderCount.current,
          });
        }

        // Throttled warnings for slow renders
        if (
          renderTime > 100 &&
          now - lastWarningTime.current > WARNING_THROTTLE_MS
        ) {
          lastWarningTime.current = now;
          logger.warn(`Slow component render detected`, {
            component: componentName || 'Unknown',
            renderTime: `${renderTime.toFixed(2)}ms`,
            renderCount: renderCount.current,
          });
        }
      }
    };
  });

  return {
    renderCount: renderCount.current,
  };
};

/**
 * Hook for optimized event handlers
 * Wraps useCallback with proper typing for event handlers with any signature
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useOptimizedEventHandler = <T extends (...args: any[]) => void>(
  handler: T,
  deps: ReadonlyArray<unknown> = []
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(handler, deps) as T;
};
