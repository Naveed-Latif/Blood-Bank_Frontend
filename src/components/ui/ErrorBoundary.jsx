import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and update state with error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    // Reset the error boundary state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div className={`${this.props.className || ''} p-4`}>
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              
              <h2 className="text-xl font-semibold text-red-800 mb-3">
                {this.props.title || 'Something went wrong'}
              </h2>
              
              <p className="text-red-600 mb-4">
                {this.props.message || 'An unexpected error occurred in this component. Please try again.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                <Button
                  onClick={this.handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Reload Page
                </Button>
              </div>
              
              {this.props.showDetails && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-red-500 hover:text-red-700 mb-2">
                    Show error details
                  </summary>
                  <div className="p-3 bg-red-100 rounded text-sm">
                    <div className="font-semibold text-red-800 mb-2">Error:</div>
                    <div className="font-mono text-red-700 mb-3">
                      {this.state.error && this.state.error.toString()}
                    </div>
                    
                    {this.state.errorInfo && (
                      <>
                        <div className="font-semibold text-red-800 mb-2">Component Stack:</div>
                        <div className="font-mono text-red-700 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// Higher-order component to wrap components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook to trigger error boundary (for functional components)
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    // This will trigger the error boundary
    throw error;
  };
};

export default ErrorBoundary;