export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  sessionId?: string;
}

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  context?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private readonly maxLogs = 1000;
  private readonly maxMetrics = 500;
  private currentLevel: LogLevel = LogLevel.INFO;
  private sessionId: string;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment =
      typeof window !== 'undefined'
        ? process.env.NODE_ENV === 'development'
        : process.env.NODE_ENV === 'development';
    this.sessionId = this.generateSessionId();
    this.currentLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
    this.log(LogLevel.INFO, 'Logger initialized', {
      sessionId: this.sessionId,
    });
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private sanitizeContext(
    context?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!context) return undefined;
    const sanitized: Record<string, unknown> = {};
    try {
      for (const [key, value] of Object.entries(context)) {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && !(value instanceof Error)) {
            try {
              JSON.stringify(value);
              sanitized[key] = value;
            } catch {
              sanitized[key] = '[Circular or non-serializable]';
            }
          } else {
            sanitized[key] = value;
          }
        }
      }
    } catch (error) {
      return {
        error: 'Failed to sanitize context',
        originalError: String(error),
      };
    }
    return sanitized;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const sanitizedContext = this.sanitizeContext(context);

    let formattedMessage = `[${timestamp}] ${levelName}: ${message}`;

    if (sanitizedContext && Object.keys(sanitizedContext).length > 0) {
      try {
        formattedMessage += ` | Context: ${JSON.stringify(sanitizedContext)}`;
      } catch {
        formattedMessage += ` | Context: [Unable to stringify]`;
      }
    }

    if (error) {
      formattedMessage += ` | Error: ${error.message || 'Unknown error'}`;
      if (error.stack && this.isDevelopment) {
        formattedMessage += ` | Stack: ${error.stack.substring(0, 500)}`;
      }
    }

    return formattedMessage;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private addPerformanceMetric(metric: PerformanceMetric): void {
    this.performanceMetrics.push(metric);
    if (this.performanceMetrics.length > this.maxMetrics) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetrics);
    }
  }

  public log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.shouldLog(level) || !message) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: String(message),
      context: this.sanitizeContext(context),
      error: error instanceof Error ? error : undefined,
      sessionId: this.sessionId,
    };

    this.addLog(entry);

    if (typeof window === 'undefined') return;

    const formattedMessage = this.formatMessage(level, message, context, error);

    try {
      switch (level) {
        case LogLevel.DEBUG:
          if (this.isDevelopment) {
            // eslint-disable-next-line no-console
            console.debug(`🐛 ${formattedMessage}`);
          }
          break;
        case LogLevel.INFO:
          if (this.isDevelopment) {
            // eslint-disable-next-line no-console
            console.info(`ℹ️ ${formattedMessage}`);
          }
          break;
        case LogLevel.WARN:
          console.warn(`⚠️ ${formattedMessage}`);
          break;
        case LogLevel.ERROR:
          console.error(`❌ ${formattedMessage}`);
          break;
      }
    } catch (e) {
      console.error('Logger error:', e);
    }
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public clearMetrics(): void {
    this.performanceMetrics = [];
  }

  public exportLogs(): string {
    try {
      return JSON.stringify(
        {
          logs: this.logs,
          metrics: this.performanceMetrics,
          sessionId: this.sessionId,
        },
        null,
        2
      );
    } catch {
      return JSON.stringify({ error: 'Failed to export logs' });
    }
  }

  public trackPerformance(
    operation: string,
    startTime: number,
    context?: Record<string, unknown>
  ): void {
    const duration =
      typeof performance !== 'undefined' ? performance.now() - startTime : 0;
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: Date.now(),
      context: this.sanitizeContext(context),
    };
    this.addPerformanceMetric(metric);

    if (duration > 100) {
      this.warn(`Slow operation detected: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        ...context,
      });
    } else if (this.isDevelopment) {
      this.debug(`Performance: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        ...context,
      });
    }
  }
}

export const logger = Logger.getInstance();

export const trackError = (
  error: Error | unknown,
  context?: Record<string, unknown>
): void => {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error('Application error occurred', err, context);

  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    try {
      if ('gtag' in window) {
        (window as { gtag?: (...args: unknown[]) => void }).gtag?.(
          'event',
          'exception',
          {
            description: err.message,
            fatal: false,
          }
        );
      }
    } catch {
      // Silently fail if analytics is not available
    }
  }
};

export const trackPerformance = (
  operation: string,
  startTime: number,
  context?: Record<string, unknown>
): void => {
  logger.trackPerformance(operation, startTime, context);
};
