import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Show error toast to user
    toast({
      title: "예상치 못한 오류가 발생했습니다",
      description: error.message || "알 수 없는 오류가 발생했습니다. 페이지를 새로고침해주세요.",
      variant: "destructive",
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="text-red-500 text-6xl">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900">오류가 발생했습니다</h1>
            <p className="text-gray-600">
              {this.state.error?.message || "예상치 못한 오류가 발생했습니다."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 