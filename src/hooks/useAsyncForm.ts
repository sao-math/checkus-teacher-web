import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

/**
 * Configuration for async form submission
 * @public
 */
export interface AsyncFormConfig<TData = any, TResponse = any> {
  /** Function to submit the form data */
  onSubmit: (data: TData) => Promise<TResponse>;
  /** Messages to show on success/error */
  messages?: {
    /** Success message title */
    successTitle?: string;
    /** Success message description */
    successDescription?: string | ((data: TData, response: TResponse) => string);
    /** Error message title */
    errorTitle?: string;
    /** Error message description */
    errorDescription?: string | ((error: unknown) => string);
  };
  /** Redirect configuration after successful submission */
  redirect?: {
    /** Path to redirect to on success */
    path: string;
    /** Whether to replace current history entry */
    replace?: boolean;
    /** Delay before redirect (ms) */
    delay?: number;
  };
  /** Called on successful submission before redirect */
  onSuccess?: (data: TData, response: TResponse) => void | Promise<void>;
  /** Called on error before showing error message */
  onError?: (error: unknown, data: TData) => void | Promise<void>;
  /** Called before submission starts */
  onBeforeSubmit?: (data: TData) => void | Promise<void>;
  /** Called after submission completes (success or error) */
  onAfterSubmit?: (data: TData, error?: unknown, response?: TResponse) => void | Promise<void>;
}

/**
 * Return type for useAsyncForm hook
 * @public
 */
export interface UseAsyncFormReturn<TData = any, TResponse = any> {
  /** Whether form submission is in progress */
  isSubmitting: boolean;
  /** Last submission error, if any */
  error: unknown | null;
  /** Last successful response, if any */
  response: TResponse | null;
  /** Whether last submission was successful */
  isSuccess: boolean;
  /** Submit the form with given data */
  submit: (data: TData) => Promise<void>;
  /** Submit handler for form onSubmit event */
  handleSubmit: (data: TData) => (e: React.FormEvent) => Promise<void>;
  /** Reset the submission state */
  reset: () => void;
  /** Set error manually */
  setError: (error: unknown) => void;
}

/**
 * Hook for handling async form submissions with integrated loading, error handling, and success management
 * 
 * This hook abstracts common patterns found in form submission handlers throughout the application,
 * providing automatic loading states, error handling with toast notifications, success handling
 * with optional redirects, and comprehensive lifecycle callbacks.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const asyncForm = useAsyncForm({
 *   onSubmit: async (data) => {
 *     return await api.updateUser(data);
 *   },
 *   messages: {
 *     successTitle: "성공",
 *     successDescription: "사용자 정보가 업데이트되었습니다.",
 *     errorTitle: "오류",
 *     errorDescription: "업데이트에 실패했습니다."
 *   },
 *   redirect: {
 *     path: '/users'
 *   }
 * });
 * 
 * const form = useForm({...});
 * 
 * const handleSubmit = asyncForm.handleSubmit(form.values);
 * 
 * return (
 *   <form onSubmit={handleSubmit}>
 *     // form fields
 *     <button type="submit" disabled={asyncForm.isSubmitting}>
 *       {asyncForm.isSubmitting ? '저장 중...' : '저장'}
 *     </button>
 *   </form>
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Advanced usage with dynamic messages and callbacks
 * const asyncForm = useAsyncForm({
 *   onSubmit: async (teacherData) => {
 *     return await adminApi.updateTeacher(teacherData.id, teacherData);
 *   },
 *   messages: {
 *     successTitle: "교사 정보 수정 완료",
 *     successDescription: (data, response) => 
 *       `${data.name} 교사의 정보가 성공적으로 수정되었습니다.`,
 *     errorTitle: "수정 실패",
 *     errorDescription: (error) => 
 *       `교사 정보 수정에 실패했습니다: ${error.message}`
 *   },
 *   onSuccess: async (data, response) => {
 *     // Additional success handling
 *     await invalidateCache(['teachers', data.id]);
 *   },
 *   onError: async (error, data) => {
 *     // Error logging
 *     logger.error('Teacher update failed', { error, data });
 *   },
 *   redirect: {
 *     path: `/teachers/${teacherData.id}`,
 *     delay: 1000
 *   }
 * });
 * ```
 * 
 * @param config - Configuration for async form handling
 * @returns Async form state and handlers
 * 
 * @since 1.0.0
 * @author CheckUS Team
 * 
 * @public
 */
export const useAsyncForm = <TData = any, TResponse = any>(
  config: AsyncFormConfig<TData, TResponse>
): UseAsyncFormReturn<TData, TResponse> => {
  const {
    onSubmit,
    messages = {},
    redirect,
    onSuccess,
    onError,
    onBeforeSubmit,
    onAfterSubmit
  } = config;

  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setErrorState] = useState<unknown | null>(null);
  const [response, setResponse] = useState<TResponse | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Main submit function
   */
  const submit = useCallback(async (data: TData): Promise<void> => {
    try {
      // Reset previous state
      setErrorState(null);
      setResponse(null);
      setIsSuccess(false);
      setIsSubmitting(true);

      // Pre-submission callback
      if (onBeforeSubmit) {
        await onBeforeSubmit(data);
      }

      // Submit the form
      const submitResponse = await onSubmit(data);
      setResponse(submitResponse);
      setIsSuccess(true);

      // Success callback
      if (onSuccess) {
        await onSuccess(data, submitResponse);
      }

      // Show success message
      if (messages.successTitle || messages.successDescription) {
        const description = typeof messages.successDescription === 'function' 
          ? messages.successDescription(data, submitResponse)
          : messages.successDescription;

        toast({
          title: messages.successTitle || "성공",
          description: description || "작업이 완료되었습니다.",
          variant: "default"
        });
      }

      // Handle redirect
      if (redirect) {
        const redirectFn = () => {
          if (redirect.replace) {
            navigate(redirect.path, { replace: true });
          } else {
            navigate(redirect.path);
          }
        };

        if (redirect.delay && redirect.delay > 0) {
          setTimeout(redirectFn, redirect.delay);
        } else {
          redirectFn();
        }
      }

      // Post-submission callback (success)
      if (onAfterSubmit) {
        await onAfterSubmit(data, undefined, submitResponse);
      }

    } catch (submitError) {
      setErrorState(submitError);
      setIsSuccess(false);

      // Error callback
      if (onError) {
        await onError(submitError, data);
      }

      // Show error message
      if (messages.errorTitle || messages.errorDescription) {
        const description = typeof messages.errorDescription === 'function'
          ? messages.errorDescription(submitError)
          : messages.errorDescription;

        toast({
          title: messages.errorTitle || "오류 발생",
          description: description || "작업 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }

      // Post-submission callback (error)
      if (onAfterSubmit) {
        await onAfterSubmit(data, submitError);
      }

      // Re-throw error for additional handling if needed
      throw submitError;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    onSubmit,
    onSuccess,
    onError,
    onBeforeSubmit,
    onAfterSubmit,
    messages,
    redirect,
    navigate,
    toast
  ]);

  /**
   * Form event handler that prevents default and calls submit
   */
  const handleSubmit = useCallback((data: TData) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      await submit(data);
    };
  }, [submit]);

  /**
   * Reset submission state
   */
  const reset = useCallback(() => {
    setIsSubmitting(false);
    setErrorState(null);
    setResponse(null);
    setIsSuccess(false);
  }, []);

  /**
   * Set error manually
   */
  const setError = useCallback((newError: unknown) => {
    setErrorState(newError);
    setIsSuccess(false);
  }, []);

  return {
    isSubmitting,
    error,
    response,
    isSuccess,
    submit,
    handleSubmit,
    reset,
    setError
  };
};

/**
 * Pre-configured useAsyncForm for common scenarios
 */
export const useAsyncFormPresets = {
  /**
   * Preset for teacher management forms
   */
  teacher: <TData extends { id?: number; name: string }>(
    onSubmit: (data: TData) => Promise<any>,
    isEdit: boolean = false
  ) => useAsyncForm({
    onSubmit,
    messages: {
      successTitle: isEdit ? "교사 정보 수정 완료" : "교사 등록 완료",
      successDescription: (data: TData) => 
        `${data.name} 교사의 정보가 성공적으로 ${isEdit ? '수정' : '등록'}되었습니다.`,
      errorTitle: isEdit ? "수정 실패" : "등록 실패",
      errorDescription: `교사 정보 ${isEdit ? '수정' : '등록'}에 실패했습니다. 다시 시도해주세요.`
    },
    redirect: {
      path: isEdit && 'id' in onSubmit ? `/teachers/${(onSubmit as any).id}` : '/teachers'
    }
  }),

  /**
   * Preset for student management forms
   */
  student: <TData extends { id?: number; name: string }>(
    onSubmit: (data: TData) => Promise<any>,
    isEdit: boolean = false
  ) => useAsyncForm({
    onSubmit,
    messages: {
      successTitle: isEdit ? "학생 정보 수정 완료" : "학생 등록 완료",
      successDescription: (data: TData) => 
        `${data.name} 학생의 정보가 성공적으로 ${isEdit ? '수정' : '등록'}되었습니다.`,
      errorTitle: isEdit ? "수정 실패" : "등록 실패",
      errorDescription: `학생 정보 ${isEdit ? '수정' : '등록'}에 실패했습니다. 다시 시도해주세요.`
    },
    redirect: {
      path: '/students'
    }
  }),

  /**
   * Preset for authentication forms
   */
  auth: <TData = any>(
    onSubmit: (data: TData) => Promise<any>,
    successPath: string = '/dashboard'
  ) => useAsyncForm({
    onSubmit,
    messages: {
      successTitle: "로그인 성공",
      successDescription: "환영합니다!",
      errorTitle: "로그인 실패",
      errorDescription: "아이디 또는 비밀번호를 확인해주세요."
    },
    redirect: {
      path: successPath,
      delay: 500
    }
  })
}; 