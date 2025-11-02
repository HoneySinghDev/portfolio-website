'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger, trackError } from './logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  fallbackRenderer?: (
    error: Error,
    errorInfo: ErrorInfo,
    resetError: () => void
  ) => ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorBoundaryKey: number;
}

/**
 * Error Boundary Component for catching and handling React errors
 * Provides comprehensive error logging and user-friendly fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorBoundaryKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;

    if (this.state.hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    if (
      this.state.hasError &&
      resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.resetErrorBoundary();
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      componentStack:
        errorInfo.componentStack || 'No component stack available',
      errorBoundary: 'ErrorBoundary',
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack || 'No stack trace available',
    };

    trackError(error, errorDetails);

    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (onErrorError) {
        logger.error(
          'Error in onError callback',
          onErrorError instanceof Error
            ? onErrorError
            : new Error(String(onErrorError))
        );
      }
    }
  }

  override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorBoundaryKey: prevState.errorBoundaryKey + 1,
    }));
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      try {
        window.location.reload();
      } catch (error) {
        logger.error(
          'Error reloading page',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallbackRenderer) {
        return this.props.fallbackRenderer(
          this.state.error,
          this.state.errorInfo || {
            componentStack: '',
          },
          this.handleRetry
        );
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      const error = this.state.error;
      const errorInfo = this.state.errorInfo;

      return (
        <div
          className='min-h-screen flex items-center justify-center bg-black text-white p-4'
          key={this.state.errorBoundaryKey}
        >
          <div className='max-w-md w-full bg-gray-900 border border-red-500 rounded-lg p-6 text-center'>
            <div
              className='text-red-500 text-6xl mb-4'
              role='img'
              aria-label='Warning'
            >
              ⚠️
            </div>
            <h2 className='text-2xl font-bold mb-4 text-red-400'>
              Something went wrong
            </h2>
            <p className='text-gray-300 mb-6'>
              We're sorry, but something unexpected happened. Please try
              refreshing the page or contact support if the problem persists.
            </p>

            {isDevelopment && error && (
              <details className='mb-6 text-left'>
                <summary className='cursor-pointer text-yellow-400 mb-2'>
                  Error Details (Development)
                </summary>
                <div className='bg-gray-800 p-3 rounded text-sm font-mono text-red-300 overflow-auto max-h-40'>
                  <div className='mb-2'>
                    <strong>Error:</strong> {error.message || 'Unknown error'}
                  </div>
                  {error.stack && (
                    <div className='mb-2'>
                      <strong>Stack:</strong>
                      <pre className='whitespace-pre-wrap text-xs mt-1 break-words'>
                        {error.stack.substring(0, 1000)}
                      </pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className='whitespace-pre-wrap text-xs mt-1 break-words'>
                        {errorInfo.componentStack.substring(0, 1000)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className='flex gap-3 justify-center flex-wrap'>
              <button
                onClick={this.handleRetry}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
                aria-label='Try again'
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className='px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500'
                aria-label='Reload page'
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for handling async errors in functional components
 */
export const useAsyncError = () => {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    trackError(error, { hook: 'useAsyncError' });
    setError(() => {
      throw error;
    });
  }, []);
};

/**
 * Higher-order component for wrapping components with error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
