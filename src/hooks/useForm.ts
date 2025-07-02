import { useState, useCallback } from 'react';

/**
 * Form field configuration for validation and behavior
 * @public
 */
export interface FormFieldConfig {
  /** Initial value for the field */
  initialValue?: any;
  /** Validation rules for the field */
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  /** Transform function to apply when value changes */
  transform?: (value: any) => any;
}

/**
 * Form configuration object
 * @public
 */
export interface FormConfig<T = Record<string, any>> {
  /** Initial values for form fields */
  initialValues?: Partial<T>;
  /** Field-specific configurations */
  fields?: Partial<Record<keyof T, FormFieldConfig>>;
  /** Form-level validation function */
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  /** Called when form values change */
  onChange?: (values: T, changedField?: keyof T) => void;
}

/**
 * Form validation errors
 * @public
 */
export type FormErrors<T = Record<string, any>> = Partial<Record<keyof T, string>>;

/**
 * useForm hook return interface
 * @public
 */
export interface UseFormReturn<T = Record<string, any>> {
  /** Current form values */
  values: T;
  /** Current validation errors */
  errors: FormErrors<T>;
  /** Whether form has been modified from initial values */
  isDirty: boolean;
  /** Whether form is currently valid (no errors) */
  isValid: boolean;
  /** Whether any field has been touched */
  isTouched: boolean;
  /** Fields that have been touched */
  touchedFields: Record<keyof T, boolean>;
  /** Update a specific field value */
  setFieldValue: (field: keyof T, value: any) => void;
  /** Update multiple field values */
  setValues: (values: Partial<T>) => void;
  /** Mark a field as touched */
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  /** Set form errors manually */
  setErrors: (errors: FormErrors<T>) => void;
  /** Handle input change events */
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** Handle blur events */
  handleBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** Validate entire form */
  validate: () => boolean;
  /** Validate specific field */
  validateField: (field: keyof T) => boolean;
  /** Reset form to initial values */
  reset: (newInitialValues?: Partial<T>) => void;
  /** Reset only errors */
  resetErrors: () => void;
  /** Get field props for easy integration with inputs */
  getFieldProps: (field: keyof T) => {
    name: string;
    value: any;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  };
}

/**
 * Common validation functions
 * @internal
 */
const validators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return '필수 입력 항목입니다.';
    }
    if (typeof value === 'string' && value.trim() === '') {
      return '필수 입력 항목입니다.';
    }
    return null;
  },
  
  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `최소 ${min}자 이상 입력해주세요.`;
    }
    return null;
  },
  
  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `최대 ${max}자까지 입력 가능합니다.`;
    }
    return null;
  },
  
  pattern: (pattern: RegExp, message: string = '올바른 형식을 입력해주세요.') => (value: string) => {
    if (value && !pattern.test(value)) {
      return message;
    }
    return null;
  }
};

/**
 * Powerful form management hook that handles state, validation, and common form operations
 * 
 * This hook extracts common patterns from form components throughout the application,
 * providing a unified interface for form management with built-in validation,
 * dirty state tracking, and field-level control.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const form = useForm({
 *   initialValues: { name: '', email: '' },
 *   fields: {
 *     name: { validation: { required: true, minLength: 2 } },
 *     email: { validation: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ } }
 *   }
 * });
 * 
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); if (form.validate()) handleSubmit(form.values); }}>
 *     <input {...form.getFieldProps('name')} placeholder="Name" />
 *     {form.errors.name && <span>{form.errors.name}</span>}
 *     
 *     <input {...form.getFieldProps('email')} placeholder="Email" />
 *     {form.errors.email && <span>{form.errors.email}</span>}
 *   </form>
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // With custom validation
 * const form = useForm({
 *   initialValues: { password: '', confirmPassword: '' },
 *   validate: (values) => {
 *     const errors: FormErrors<typeof values> = {};
 *     if (values.password !== values.confirmPassword) {
 *       errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
 *     }
 *     return errors;
 *   }
 * });
 * ```
 * 
 * @param config - Form configuration object
 * @returns Form state and handlers
 * 
 * @since 1.0.0
 * @author CheckUS Team
 * 
 * @public
 */
export const useForm = <T extends Record<string, any> = Record<string, any>>(
  config: FormConfig<T> = {}
): UseFormReturn<T> => {
  const { initialValues = {} as T, fields, validate: formValidate, onChange } = config;
  
  // Form state
  const [values, setFormValues] = useState<T>(initialValues as T);
  const [errors, setFormErrors] = useState<FormErrors<T>>({});
  const [touchedFields, setTouchedFields] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  
  // Derived state
  const isDirty = Object.keys(values).some(key => values[key] !== (initialValues as any)[key]);
  const isValid = Object.keys(errors).length === 0;
  const isTouched = Object.keys(touchedFields).some(key => touchedFields[key]);
  
  /**
   * Validate a single field based on its configuration
   */
  const validateSingleField = useCallback((field: keyof T, value: any): string | null => {
    if (!fields) return null;
    const fieldConfig = fields[field];
    if (!fieldConfig?.validation) return null;
    
    const { validation } = fieldConfig;
    
    // Required validation
    if (validation.required) {
      const error = validators.required(value);
      if (error) return error;
    }
    
    // Skip other validations if value is empty and not required
    if (!value && !validation.required) return null;
    
    // Length validations
    if (validation.minLength) {
      const error = validators.minLength(validation.minLength)(value);
      if (error) return error;
    }
    
    if (validation.maxLength) {
      const error = validators.maxLength(validation.maxLength)(value);
      if (error) return error;
    }
    
    // Pattern validation
    if (validation.pattern) {
      const error = validators.pattern(validation.pattern)(value);
      if (error) return error;
    }
    
    // Custom validation
    if (validation.custom) {
      const error = validation.custom(value);
      if (error) return error;
    }
    
    return null;
  }, [fields]);
  
  /**
   * Validate a specific field
   */
  const validateField = useCallback((field: keyof T): boolean => {
    const value = values[field];
    const error = validateSingleField(field, value);
    
    setFormErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
    
    return !error;
  }, [values, validateSingleField]);
  
  /**
   * Validate entire form
   */
  const validate = useCallback((): boolean => {
    let isFormValid = true;
    const newErrors: FormErrors<T> = {};
    
    // Field-level validation
    if (fields) {
      Object.keys(fields).forEach(fieldKey => {
        const field = fieldKey as keyof T;
        const error = validateSingleField(field, values[field]);
        if (error) {
          newErrors[field] = error;
          isFormValid = false;
        }
      });
    }
    
    // Form-level validation
    if (formValidate) {
      const formErrors = formValidate(values);
      Object.keys(formErrors).forEach(key => {
        const field = key as keyof T;
        const errorMessage = formErrors[field];
        if (errorMessage) {
          newErrors[field] = errorMessage;
          isFormValid = false;
        }
      });
    }
    
    setFormErrors(newErrors);
    return isFormValid;
  }, [values, fields, formValidate, validateSingleField]);
  
  /**
   * Set a field value with optional validation
   */
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    const fieldConfig = fields?.[field];
    const transformedValue = fieldConfig?.transform ? fieldConfig.transform(value) : value;
    
    const newValues = { ...values, [field]: transformedValue };
    setFormValues(newValues);
    
    // Auto-validate field if it has been touched
    if (touchedFields[field]) {
      const error = validateSingleField(field, transformedValue);
      setFormErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    }
    
    // Call onChange callback
    onChange?.(newValues, field);
  }, [values, fields, touchedFields, validateSingleField, onChange]);
  
  /**
   * Set multiple values at once
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    const updatedValues = { ...values, ...newValues };
    setFormValues(updatedValues);
    onChange?.(updatedValues);
  }, [values, onChange]);
  
  /**
   * Mark a field as touched
   */
  const setFieldTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: touched
    }));
  }, []);
  
  /**
   * Set errors manually
   */
  const setErrors = useCallback((newErrors: FormErrors<T>) => {
    setFormErrors(newErrors);
  }, []);
  
  /**
   * Handle input change events
   */
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const field = name as keyof T;
    
    // Handle different input types
    let fieldValue: any = value;
    if (type === 'number') {
      fieldValue = value === '' ? '' : Number(value);
    } else if (type === 'checkbox') {
      fieldValue = (event.target as HTMLInputElement).checked;
    }
    
    setFieldValue(field, fieldValue);
  }, [setFieldValue]);
  
  /**
   * Handle blur events
   */
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = event.target;
    const field = name as keyof T;
    
    setFieldTouched(field, true);
    validateField(field);
  }, [setFieldTouched, validateField]);
  
  /**
   * Reset form to initial values
   */
  const reset = useCallback((newInitialValues?: Partial<T>) => {
    const valuesToReset = newInitialValues ? { ...initialValues, ...newInitialValues } as T : initialValues as T;
    setFormValues(valuesToReset);
    setFormErrors({});
    setTouchedFields({} as Record<keyof T, boolean>);
  }, [initialValues]);
  
  /**
   * Reset only errors
   */
  const resetErrors = useCallback(() => {
    setFormErrors({});
  }, []);
  
  /**
   * Get field props for easy integration
   */
  const getFieldProps = useCallback((field: keyof T) => ({
    name: String(field),
    value: values[field] ?? '',
    onChange: handleChange,
    onBlur: handleBlur
  }), [values, handleChange, handleBlur]);
  
  return {
    values,
    errors,
    isDirty,
    isValid,
    isTouched,
    touchedFields,
    setFieldValue,
    setValues,
    setFieldTouched,
    setErrors,
    handleChange,
    handleBlur,
    validate,
    validateField,
    reset,
    resetErrors,
    getFieldProps
  };
}; 