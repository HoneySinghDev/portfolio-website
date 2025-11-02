'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';
import GitHubCalendar from 'react-github-calendar';
import type { Activity } from 'react-activity-calendar';
import {
  useFloating,
  autoUpdate,
  offset,
  shift,
  flip,
  arrow,
  FloatingPortal,
  Placement,
} from '@floating-ui/react';
import { logger, trackError, trackPerformance } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/config';

// Constants
const MOBILE_BREAKPOINT = 768;
const RESIZE_DEBOUNCE_MS = 150;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const TOOLTIP_OFFSET = 8;

interface TooltipData {
  count: number;
  date: string;
  element: Element | null;
}

/**
 * Format date string for tooltip display
 */
const formatDate = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    logger.warn('Invalid date string in tooltip', { dateString });
    return 'Invalid date';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      logger.warn('Invalid date object in tooltip', { dateString });
      return dateString;
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    trackError(error instanceof Error ? error : new Error(String(error)), {
      context: 'formatDate',
      dateString,
    });
    return dateString;
  }
};

/**
 * Tooltip component using Floating UI for automatic positioning
 * Handles all edge cases and responsive behavior automatically
 */
const ContributionTooltip = memo(({ data }: { data: TooltipData | null }) => {
  const arrowRef = useRef<HTMLDivElement>(null);

  const floatingOptions = useMemo(
    () => ({
      open: !!data,
      placement: 'top' as Placement,
      middleware: [
        offset(TOOLTIP_OFFSET),
        flip({
          fallbackAxisSideDirection: 'start',
        }),
        shift({
          padding: 8,
        }),
        arrow({
          element: arrowRef,
          padding: 4,
        }),
      ],
      ...(data?.element && {
        whileElementsMounted: autoUpdate,
      }),
    }),
    [data]
  );

  const { refs, floatingStyles, placement, middlewareData } =
    useFloating(floatingOptions);

  // Update reference element when data changes
  useEffect(() => {
    if (data?.element) {
      refs.setReference(data.element);
    } else {
      refs.setReference(null);
    }
  }, [data?.element, refs]);

  if (!data) return null;

  // Get arrow positioning from Floating UI middleware
  const arrowX = middlewareData.arrow?.x ?? null;
  const isTop = placement?.includes('top') ?? true;
  const isBottom = placement?.includes('bottom') ?? false;

  // Determine arrow position based on placement
  const getArrowStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {};

    // Horizontal positioning - align with reference element using Floating UI's calculation
    if (arrowX !== null) {
      baseStyle.left = `${arrowX}px`;
    } else {
      // Fallback: center the arrow horizontally
      baseStyle.left = '50%';
    }

    // Vertical positioning based on tooltip placement
    if (isTop) {
      // Arrow at bottom center when tooltip is above
      baseStyle.bottom = '-4px';
      if (arrowX === null) {
        baseStyle.transform = 'translateX(-50%)';
      }
    } else if (isBottom) {
      // Arrow at top center when tooltip is below
      baseStyle.top = '-4px';
      if (arrowX === null) {
        baseStyle.transform = 'translateX(-50%)';
      }
    } else {
      // For left/right placement, center vertically
      baseStyle.top = '50%';
      baseStyle.transform =
        arrowX !== null ? 'translateY(-50%)' : 'translate(-50%, -50%)';
    }

    return baseStyle;
  };

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className={cn(
          'z-[99999] pointer-events-none',
          'transition-opacity duration-150',
          'opacity-100'
        )}
      >
        <div className='bg-gray-900 border border-gray-700 rounded-lg shadow-xl px-3 py-2 text-xs max-w-[250px] relative'>
          <div className='font-semibold text-white'>
            <span className='text-gray-400'>
              {data.count} {data.count === 1 ? 'contribution' : 'contributions'}
            </span>
            <br />
            <span className='text-gray-300'>{formatDate(data.date)}</span>
          </div>
          <div
            ref={arrowRef}
            className='absolute bg-gray-900 border-gray-700 w-2 h-2 rotate-45 border-r border-b'
            style={getArrowStyle()}
          />
        </div>
      </div>
    </FloatingPortal>
  );
});

ContributionTooltip.displayName = 'ContributionTooltip';

interface GitHubContributionGraphProps {
  year?: 'last' | number;
  className?: string;
}

/**
 * Custom hook for window width tracking with debouncing
 */
const useWindowWidth = (debounceMs: number = RESIZE_DEBOUNCE_MS): number => {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceMs]);

  return width;
};

function GitHubContributionGraph({
  year = 'last',
  className,
}: GitHubContributionGraphProps) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadStartTimeRef = useRef<number>(0);

  // Window width tracking with debouncing
  const windowWidth = useWindowWidth(RESIZE_DEBOUNCE_MS);
  const isMobile = useMemo(
    () => windowWidth < MOBILE_BREAKPOINT,
    [windowWidth]
  );

  // Client-side detection
  useEffect(() => {
    try {
      setIsClient(true);
      loadStartTimeRef.current = performance.now();
    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        context: 'clientDetection',
      });
      setIsClient(true);
    }
  }, []);

  // Track performance
  useEffect(() => {
    if (isClient && loadStartTimeRef.current > 0) {
      const loadTime = performance.now() - loadStartTimeRef.current;
      trackPerformance(
        'GitHubContributionGraph: Initial Load',
        loadStartTimeRef.current,
        {
          loadTime: `${loadTime.toFixed(2)}ms`,
        }
      );
    }
  }, [isClient]);

  // Render block with tooltip support using Floating UI
  const renderBlock = useCallback(
    (block: React.ReactElement, activity: Activity): React.ReactElement => {
      if (isMobile || !activity) return block;

      try {
        const blockProps = block.props as React.SVGProps<SVGRectElement>;
        return React.cloneElement(
          block as React.ReactElement<React.SVGProps<SVGRectElement>>,
          {
            onMouseEnter: (e: React.MouseEvent<SVGRectElement>) => {
              try {
                const target = e.currentTarget as Element;
                setTooltipData({
                  count: activity.count || 0,
                  date: activity.date || new Date().toISOString(),
                  element: target,
                });
              } catch (err) {
                logger.warn('Error setting tooltip data', {
                  error: err,
                  activity,
                });
              }
            },
            onMouseLeave: () => {
              setTooltipData(null);
            },
            className: cn(
              blockProps?.className,
              'cursor-pointer transition-opacity hover:opacity-80'
            ),
            style: {
              ...blockProps?.style,
            },
          } as Partial<React.SVGProps<SVGRectElement>>
        );
      } catch (err) {
        trackError(err instanceof Error ? err : new Error(String(err)), {
          context: 'renderBlock',
          activity,
        });
        return block;
      }
    },
    [isMobile]
  );

  // Memoized calendar theme
  const calendarTheme = useMemo(
    () => ({
      light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
      dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    }),
    []
  );

  // Memoized calendar props
  const calendarProps = useMemo(() => {
    const weekdayLabels: ['mon', 'wed', 'fri'] = ['mon', 'wed', 'fri'];
    return {
      username: siteConfig.github.username.trim(),
      year,
      colorScheme: 'dark' as const,
      theme: calendarTheme,
      blockSize: isMobile ? 9 : 11,
      blockRadius: 2,
      blockMargin: isMobile ? 3 : 4,
      fontSize: isMobile ? 11 : 12,
      hideColorLegend: false,
      hideMonthLabels: false,
      hideTotalCount: false,
      showWeekdayLabels: !isMobile ? weekdayLabels : false,
      weekStart: 1 as const,
      renderBlock,
      labels: {
        totalCount: '{{count}} contributions in {{year}}',
      },
      style: {
        display: 'block' as const,
      },
      throwOnError: false,
      errorMessage:
        'Failed to load contribution data. Please verify your GitHub username.',
    };
  }, [year, isMobile, calendarTheme, renderBlock]);

  // Retry mechanism with exponential backoff
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      logger.warn('Max retry attempts reached', { retryCount });
      return;
    }

    const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
    setTimeout(() => {
      setRetryCount(prev => prev + 1);
      setError(null);
      logger.info('Retrying GitHub contribution graph load', {
        retryCount: retryCount + 1,
        delay,
      });
    }, delay);
  }, [retryCount]);

  if (!isClient) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'w-full flex items-center justify-center py-12',
          className
        )}
      >
        <div className='text-gray-400 text-sm animate-pulse'>
          Loading contribution graph...
        </div>
      </div>
    );
  }

  if (!calendarProps) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'w-full flex flex-col items-center justify-center py-12 space-y-4',
          className
        )}
      >
        <div className='text-red-400 text-sm text-center max-w-md px-4'>
          Invalid GitHub username provided. Please check your configuration.
        </div>
      </div>
    );
  }

  if (error && retryCount >= MAX_RETRIES) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'w-full flex flex-col items-center justify-center py-12 space-y-4',
          className
        )}
      >
        <div className='text-red-400 text-sm text-center max-w-md px-4'>
          {error}
        </div>
        <div className='text-gray-500 text-xs text-center px-4'>
          Please verify that the GitHub username "{siteConfig.github.username}"
          is correct and publicly accessible.
          <br />
          You can check your username at:{' '}
          <a
            href={siteConfig.contact.socialLinks.github}
            target='_blank'
            rel='noopener noreferrer'
            className='text-yellow-400 hover:text-yellow-300 underline'
          >
            {siteConfig.contact.socialLinks.github}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('w-full relative github-contribution-graph', className)}
    >
      {error && retryCount < MAX_RETRIES && (
        <div className='mb-4 text-center'>
          <div className='text-yellow-400 text-sm mb-2'>{error}</div>
          <button
            onClick={handleRetry}
            className='text-xs px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded transition-colors'
            aria-label='Retry loading contribution graph'
          >
            Retry ({MAX_RETRIES - retryCount} attempts remaining)
          </button>
        </div>
      )}

      <div className='flex justify-center items-start overflow-x-auto -mx-2 sm:-mx-4 px-2 sm:px-4 contribution-graph-container'>
        <div className='flex-shrink-0' style={{ minWidth: 'fit-content' }}>
          <GitHubCalendar
            {...calendarProps}
            key={`github-calendar-${retryCount}-${siteConfig.github.username}`}
          />
        </div>
      </div>

      {!isMobile && <ContributionTooltip data={tooltipData} />}
    </div>
  );
}

export default memo(GitHubContributionGraph);
