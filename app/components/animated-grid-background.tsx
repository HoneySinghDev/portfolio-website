'use client';

import React, { useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { logger, trackError } from '@/lib/logger';
import { useOptimizedAnimation } from '@/lib/hooks/useOptimized';

interface GridConfig {
  gridSize: number;
  smallGridSize: number;
  speed: number;
  numHighlights: number;
  opacity: number;
}

const DEFAULT_CONFIG: GridConfig = {
  gridSize: 50,
  smallGridSize: 10,
  speed: 0.0005,
  numHighlights: 5,
  opacity: 0.2,
};

function AnimatedGridBackground({
  config = DEFAULT_CONFIG,
}: {
  config?: Partial<GridConfig>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const isVisible = useRef<boolean>(true);

  const finalConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config]
  );

  // Optimized canvas setup
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) {
      logger.error('Failed to get 2D context from canvas');
      return null;
    }

    // Set canvas dimensions with device pixel ratio
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);

      logger.debug('Canvas dimensions updated', {
        width: rect.width,
        height: rect.height,
        dpr,
      });
    };

    setCanvasDimensions();
    return { ctx, setCanvasDimensions };
  }, []);

  // Optimized grid drawing with caching
  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      time: number
    ) => {
      try {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Batch drawing operations
        ctx.save();

        // Draw main grid lines
        ctx.strokeStyle = 'rgba(33, 33, 33, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        // Vertical lines
        for (let x = 0; x <= width; x += finalConfig.gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }

        // Horizontal lines
        for (let y = 0; y <= height; y += finalConfig.gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Draw smaller grid lines
        ctx.strokeStyle = 'rgba(33, 33, 33, 0.1)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();

        // Vertical small lines
        for (let x = 0; x <= width; x += finalConfig.smallGridSize) {
          if (x % finalConfig.gridSize !== 0) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
          }
        }

        // Horizontal small lines
        for (let y = 0; y <= height; y += finalConfig.smallGridSize) {
          if (y % finalConfig.gridSize !== 0) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
          }
        }
        ctx.stroke();

        // Draw animated highlights with reduced complexity
        for (let i = 0; i < finalConfig.numHighlights; i++) {
          const t = (time + i / finalConfig.numHighlights) % 1;

          // Vertical highlight
          const x =
            Math.floor((t * width) / finalConfig.gridSize) *
            finalConfig.gridSize;
          const verticalAlpha = 0.1 * Math.sin(time * 10 + i) ** 2;
          if (verticalAlpha > 0.01) {
            ctx.strokeStyle = `rgba(255, 255, 0, ${verticalAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }

          // Horizontal highlight
          const y =
            Math.floor((((t + 0.5) % 1) * height) / finalConfig.gridSize) *
            finalConfig.gridSize;
          const horizontalAlpha = 0.1 * Math.cos(time * 10 + i) ** 2;
          if (horizontalAlpha > 0.01) {
            ctx.strokeStyle = `rgba(255, 0, 255, ${horizontalAlpha})`;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
        }

        // Draw radial gradient overlay
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          0,
          width / 2,
          height / 2,
          Math.max(width, height) / 1.5
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
      } catch (error) {
        trackError(error as Error, {
          component: 'AnimatedGridBackground',
          action: 'drawGrid',
        });
      }
    },
    [finalConfig]
  );

  // Animation loop with performance monitoring
  const animationLoop = useCallback(
    (deltaTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !isVisible.current) return;

      const setup = setupCanvas();
      if (!setup) return;

      const { ctx } = setup;

      // Update time
      timeRef.current += deltaTime * finalConfig.speed * 1000;

      // Draw grid
      drawGrid(ctx, canvas, timeRef.current);

      // Performance monitoring
      frameCount.current++;
      if (frameCount.current % 60 === 0) {
        const fps = 1000 / deltaTime;
        if (fps < 30) {
          logger.warn('Low FPS detected in grid animation', {
            fps: fps.toFixed(1),
          });
        }
      }
    },
    [setupCanvas, drawGrid, finalConfig.speed]
  );

  // Use optimized animation hook
  const { startAnimation, stopAnimation } = useOptimizedAnimation(
    animationLoop,
    [animationLoop]
  );

  // Handle visibility changes for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
      if (isVisible.current) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [startAnimation, stopAnimation]);

  // Initialize canvas and start animation
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    let handleResize: (() => void) | null = null;

    try {
      const setup = setupCanvas();
      if (!setup) {
        return () => {
          stopAnimation();
        };
      }

      const { setCanvasDimensions } = setup;

      // Add resize listener with throttling
      handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          setCanvasDimensions();
        }, 100);
      };

      window.addEventListener('resize', handleResize, { passive: true });

      // Start animation
      startAnimation();

      logger.info('AnimatedGridBackground initialized');
    } catch (error) {
      trackError(error as Error, {
        component: 'AnimatedGridBackground',
        action: 'initialization',
      });
    }

    return () => {
      stopAnimation();
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (resizeTimeout !== undefined) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [setupCanvas, startAnimation, stopAnimation]);

  return (
    <canvas
      ref={canvasRef}
      className='fixed inset-0 z-0'
      style={{
        pointerEvents: 'none',
        opacity: finalConfig.opacity,
        willChange: 'transform',
      }}
    />
  );
}

export default memo(AnimatedGridBackground);
