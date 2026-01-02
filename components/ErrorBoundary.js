import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from './ui';

class ErrorFallback extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} variant="primary" size="md" className="w-full">Refresh Page</Button>
              <Button onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })} variant="ghost" size="md" className="w-full">Try Again</Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
export const ErrorBoundary = ({ children, fallback, onError }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={onError}
      onReset={() => {
        // Reset error state
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Specialized error boundary for course components
export const CourseErrorBoundary = ({ children }) => {
  const CourseErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-center">
        <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-medium text-red-800">
          Failed to load course content
        </h3>
      </div>
      <p className="mt-2 text-sm text-red-700">
        There was an error loading this course. Please try again.
      </p>
      <Button onClick={resetErrorBoundary} variant="primary" size="sm">Retry</Button>
    </div>
  );

  return (
    <ErrorBoundary fallback={CourseErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Error boundary for API calls
export const APIErrorBoundary = ({ children }) => {
  const APIErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
      <div className="flex items-center">
        <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-medium text-yellow-800">
          Connection Error
        </h3>
      </div>
      <p className="mt-2 text-sm text-yellow-700">
        Unable to connect to our servers. Please check your internet connection and try again.
      </p>
      <Button onClick={resetErrorBoundary} variant="primary" size="sm">Retry</Button>
    </div>
  );

  return (
    <ErrorBoundary fallback={APIErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Hook for handling async errors
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Async error caught:', error, errorInfo);
    }

    // In production, send to error reporting service
    // Example: Sentry.captureException(error);
  };
};

export default ErrorBoundary;