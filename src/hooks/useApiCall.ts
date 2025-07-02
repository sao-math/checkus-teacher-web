import { useState, useCallback, useRef, useEffect } from 'react';
import { isAxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import { useToast } from '@/hooks/use-toast';

/**
 * API call configuration options
 * @public
 */
export interface ApiCallConfig {
  /** Show loading state during API call */
  showLoading?: boolean;
  /** Show error toast on failure */
  showErrorToast?: boolean;
  /** Show success toast on success */
  showSuccessToast?: boolean;
  /** Custom success message */
  successMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Retry configuration */
  retry?: {
    attempts?: number;
    delay?: number;
    exponentialBackoff?: boolean;
  };
  /** Enable request cancellation on component unmount */
  enableAbortController?: boolean;
  /** Transform response data */
  transform?: (data: any) => any;
  /** Custom error handler */
  onError?: (error: any) => void;
  /** Custom success handler */
  onSuccess?: (data: any) => void;
}

/**
 * API call state
 * @public
 */
export interface ApiCallState<T = any> {
  /** Loading state */
  loading: boolean;
  /** Response data */
  data: T | null;
  /** Error object */
  error: Error | null;
  /** Last successful response */
  lastResponse: AxiosResponse<any> | null;
}

/**
 * useApiCall hook return interface
 * @public
 */
export interface UseApiCallReturn<T = any> extends ApiCallState<T> {
  /** Execute the API call */
  execute: (...args: any[]) => Promise<T>;
  /** Reset state to initial values */
  reset: () => void;
  /** Cancel ongoing request */
  cancel: () => void;
  /** Retry last failed request */
  retry: () => Promise<T | null>;
}

/**
 * Default configuration
 * @internal
 */
const defaultConfig: Required<Omit<ApiCallConfig, 'successMessage' | 'errorMessage' | 'onError' | 'onSuccess' | 'transform'>> = {
  showLoading: true,
  showErrorToast: true,
  showSuccessToast: false,
  retry: {
    attempts: 0,
    delay: 1000,
    exponentialBackoff: false
  },
  enableAbortController: true
};

/**
 * Utility function to extract data from API response
 * @internal
 */
const extractResponseData = (response: AxiosResponse<any>) => {
  // Handle different response patterns
  if (response.data?.data !== undefined) {
    return response.data.data; // response.data.data pattern
  }
  if (response.data !== undefined) {
    return response.data; // response.data pattern
  }
  return response; // raw response
};

/**
 * Utility function to format error message
 * @internal
 */
const formatErrorMessage = (error: any): string => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    return `API Error (${status || 'Unknown'}): ${message}`;
  }
  return error?.message || 'Unknown error occurred';
};

/**
 * Utility function to log API errors
 * @internal
 */
const logApiError = (error: any, endpoint?: string) => {
  if (isAxiosError(error)) {
    console.error('API Error:', {
      endpoint,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('Non-Axios Error:', {
      endpoint,
      error,
      message: error?.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Powerful API call management hook that standardizes API operations
 * 
 * This hook eliminates duplicate API patterns throughout the application,
 * providing unified loading state management, error handling, retry logic,
 * and request cancellation.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const studentDetail = useApiCall(
 *   (studentId: number) => api.get(`/students/${studentId}`),
 *   { showSuccessToast: false }
 * );
 * 
 * // In component
 * useEffect(() => {
 *   studentDetail.execute(123);
 * }, []);
 * 
 * if (studentDetail.loading) return <Loading />;
 * if (studentDetail.error) return <Error />;
 * return <div>{studentDetail.data?.name}</div>;
 * ```
 * 
 * @example
 * ```typescript
 * // With retry and custom error handling
 * const updateStudent = useApiCall(
 *   (id: number, data: StudentData) => api.put(`/students/${id}`, data),
 *   {
 *     showSuccessToast: true,
 *     successMessage: "학생 정보가 업데이트되었습니다",
 *     retry: { attempts: 3, delay: 1000, exponentialBackoff: true },
 *     onSuccess: (data) => navigate(`/students/${data.id}`)
 *   }
 * );
 * ```
 * 
 * @param apiFunction - The API function to execute
 * @param config - Configuration options
 * @returns API call state and handlers
 * 
 * @since 2.0.0
 * @author CheckUS Team
 * 
 * @public
 */
export const useApiCall = <T = any>(
  apiFunction: (...args: any[]) => Promise<AxiosResponse<any>>,
  config: ApiCallConfig = {}
): UseApiCallReturn<T> => {
  const { toast } = useToast();
  const mergedConfig = { ...defaultConfig, ...config };
  
  // State
  const [state, setState] = useState<ApiCallState<T>>({
    loading: false,
    data: null,
    error: null,
    lastResponse: null
  });
  
  // Refs for cleanup and retry
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastArgsRef = useRef<any[]>([]);
  const mountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  /**
   * Sleep utility for retry delays
   */
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  /**
   * Execute API call with retry logic
   */
  const executeWithRetry = useCallback(async (
    args: any[],
    attempt = 1
  ): Promise<T> => {
    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Setup abort controller
      if (mergedConfig.enableAbortController) {
        abortControllerRef.current = new AbortController();
      }
      
      // Set loading state
      if (mountedRef.current && mergedConfig.showLoading) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }
      
      // Execute API call
      const response = await apiFunction(...args);
      
      // Check if component is still mounted
      if (!mountedRef.current) {
        return Promise.reject(new Error('Component unmounted'));
      }
      
      // Extract and transform data
      let data = extractResponseData(response);
      if (config.transform) {
        data = config.transform(data);
      }
      
      // Update state
      setState({
        loading: false,
        data,
        error: null,
        lastResponse: response
      });
      
      // Success handling
      if (mergedConfig.showSuccessToast && config.successMessage) {
        toast({
          title: "성공",
          description: config.successMessage,
        });
      }
      
      // Custom success handler
      config.onSuccess?.(data);
      
      return data;
      
    } catch (error: any) {
      // Don't handle cancelled requests
      if (error.name === 'CancelledError' || error.code === 'ERR_CANCELED') {
        return Promise.reject(error);
      }
      
      // Check if component is still mounted
      if (!mountedRef.current) {
        return Promise.reject(error);
      }
      
      // Log error
      logApiError(error, 'API Call');
      
      // Retry logic
      const maxAttempts = mergedConfig.retry.attempts + 1;
      if (attempt < maxAttempts) {
        const delay = mergedConfig.retry.exponentialBackoff 
          ? mergedConfig.retry.delay * Math.pow(2, attempt - 1)
          : mergedConfig.retry.delay;
          
        console.log(`Retrying API call (attempt ${attempt + 1}/${maxAttempts}) after ${delay}ms`);
        await sleep(delay);
        return executeWithRetry(args, attempt + 1);
      }
      
      // Format error
      const formattedError = new Error(formatErrorMessage(error));
      
      // Update state
      setState(prev => ({
        ...prev,
        loading: false,
        error: formattedError
      }));
      
      // Error handling
      if (mergedConfig.showErrorToast) {
        const errorMessage = config.errorMessage || formattedError.message;
        toast({
          title: "오류",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Custom error handler
      config.onError?.(error);
      
      throw formattedError;
    }
  }, [apiFunction, config, mergedConfig, toast]);
  
  /**
   * Main execute function
   */
  const execute = useCallback(async (...args: any[]): Promise<T> => {
    lastArgsRef.current = args;
    return executeWithRetry(args);
  }, [executeWithRetry]);
  
  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      data: null,
      error: null,
      lastResponse: null
    });
  }, []);
  
  /**
   * Cancel ongoing request
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);
  
  /**
   * Retry last failed request
   */
  const retry = useCallback(async (): Promise<T | null> => {
    if (lastArgsRef.current.length === 0) {
      console.warn('No previous API call to retry');
      return null;
    }
    return execute(...lastArgsRef.current);
  }, [execute]);
  
  return {
    ...state,
    execute,
    reset,
    cancel,
    retry
  };
}; 