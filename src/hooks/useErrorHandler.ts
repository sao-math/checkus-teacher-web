import { useCallback } from 'react';
import { handleError } from '@/lib/errorHandler';

interface UseErrorHandlerOptions {
  title?: string;
  fallbackMessage?: string;
  showToast?: boolean;
}

export const useErrorHandler = (defaultOptions: UseErrorHandlerOptions = {}) => {
  const showError = useCallback((
    error: unknown,
    options: UseErrorHandlerOptions = {}
  ) => {
    const mergedOptions = { ...defaultOptions, ...options };
    return handleError(error, mergedOptions);
  }, [defaultOptions]);

  return { showError };
}; 