import { toast } from '@/hooks/use-toast';
import { isAxiosError } from 'axios';

interface ErrorDetails {
  title?: string;
  fallbackMessage?: string;
  showToast?: boolean;
}

// Debounce mechanism to prevent duplicate toasts
const recentErrors = new Map<string, number>();
const ERROR_DEBOUNCE_TIME = 3000; // 3 seconds

export const handleError = (
  error: unknown,
  details: ErrorDetails = {}
) => {
  const {
    title = "오류 발생",
    fallbackMessage = "알 수 없는 오류가 발생했습니다.",
    showToast = true
  } = details;

  let errorMessage = fallbackMessage;

  // Extract meaningful error message
  if (isAxiosError(error)) {
    // Server response error
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          errorMessage = "잘못된 요청입니다.";
          break;
        case 401:
          errorMessage = "인증이 필요합니다.";
          break;
        case 403:
          errorMessage = "권한이 없습니다.";
          break;
        case 404:
          errorMessage = "요청한 데이터를 찾을 수 없습니다.";
          break;
        case 500:
          errorMessage = "서버 오류가 발생했습니다.";
          break;
        default:
          errorMessage = `서버 오류 (${error.response.status})`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Create a unique key for this error
  const errorKey = `${title}-${errorMessage}`;
  const now = Date.now();
  
  // Check if this error was recently shown
  if (recentErrors.has(errorKey)) {
    const lastShown = recentErrors.get(errorKey)!;
    if (now - lastShown < ERROR_DEBOUNCE_TIME) {
      // Skip showing this error as it was recently shown
      return errorMessage;
    }
  }

  // Log error for debugging
  console.error('Error handled:', {
    originalError: error,
    displayMessage: errorMessage,
    details
  });

  // Show toast to user if requested
  if (showToast) {
    try {
      toast({
        title,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Record this error as shown
      recentErrors.set(errorKey, now);
      
      // Clean up old entries
      setTimeout(() => {
        recentErrors.delete(errorKey);
      }, ERROR_DEBOUNCE_TIME);
    } catch (toastError) {
      console.error('Error showing toast:', toastError);
    }
  }

  return errorMessage;
};

// Global unhandled promise rejection handler
export const setupGlobalErrorHandlers = () => {
  // Prevent multiple setup
  if (window.__globalErrorHandlersSetup) {
    return;
  }
  window.__globalErrorHandlersSetup = true;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Don't show toast for authentication errors as they're handled elsewhere
    if (isAxiosError(event.reason) && event.reason.response?.status === 401) {
      event.preventDefault();
      return;
    }
    
    handleError(event.reason, {
      title: "예상치 못한 오류",
      fallbackMessage: "처리되지 않은 오류가 발생했습니다."
    });
    
    // Prevent the default console error
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    
    handleError(event.error, {
      title: "JavaScript 오류",
      fallbackMessage: "스크립트 실행 중 오류가 발생했습니다."
    });
  });
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    __globalErrorHandlersSetup?: boolean;
  }
} 