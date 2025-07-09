import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { School, Check, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePhoneNumberInput } from '@/hooks/usePhoneNumberInput';
import { useForm } from '@/hooks/useForm';
import { useAsyncForm } from '@/hooks/useAsyncForm';
import authService from '@/services/auth';
import api from '@/lib/axios';

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  discordId: string;
}

const Register = () => {
  const navigate = useNavigate();
  
  // 전화번호 훅 사용
  const phoneNumber = usePhoneNumberInput({
    initialValue: '',
    startsWith010: true
  });

  // 실시간 사용자명 검증 상태
  const [usernameCheckState, setUsernameCheckState] = useState<{
    isChecking: boolean;
    isValid: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isValid: null,
    message: ''
  });

  // 실시간 전화번호 검증 상태
  const [phoneCheckState, setPhoneCheckState] = useState<{
    isChecking: boolean;
    isValid: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isValid: null,
    message: ''
  });

  // useForm 훅으로 폼 상태 관리 통합
  const form = useForm<RegisterFormData>({
    initialValues: {
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
      discordId: ''
    },
    fields: {
      username: {
        validation: {
          required: true,
          minLength: 4,
          maxLength: 20,
          pattern: /^[a-zA-Z0-9_]+$/,
          custom: (value: string) => {
            if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
              return '영문자, 숫자, 언더바만 사용 가능합니다.';
            }
            return null;
          }
        }
      },
      password: {
        validation: {
          required: true,
          minLength: 8,
          custom: (value: string) => {
            if (!value) return null;
            
            const hasLetter = /[a-zA-Z]/.test(value);
            const hasNumber = /[0-9]/.test(value);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            
            if (!hasLetter || !hasNumber || !hasSpecial) {
              return '비밀번호는 영문자, 숫자, 특수문자를 모두 포함해야 합니다.';
            }
            return null;
          }
        }
      },
      confirmPassword: {
        validation: {
          required: true,
          custom: (value: string) => {
            if (value && value !== form.values.password) {
              return '비밀번호가 일치하지 않습니다.';
            }
            return null;
          }
        }
      },
      name: {
        validation: {
          required: true,
          minLength: 1,
          maxLength: 50,
          custom: (value: string) => {
            if (value && !value.trim()) {
              return '이름을 입력해주세요.';
            }
            return null;
          }
        }
      },
      discordId: {
        validation: {
          maxLength: 100
        }
      }
    },
    // 폼 레벨 검증 (비밀번호 확인)
    validate: (values) => {
      const errors: Partial<Record<keyof RegisterFormData, string>> = {};
      
      if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
        errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
      
      return errors;
    }
  });

  // useAsyncForm 훅으로 비동기 제출 로직 통합
  const asyncForm = useAsyncForm<RegisterFormData & { phoneNumber: string }, any>({
    onSubmit: async (data) => {
      // 실시간 검증 결과를 활용하여 추가 확인
      if (usernameCheckState.isValid !== true) {
        throw new Error(usernameCheckState.message || '사용자명을 확인해주세요.');
      }

      if (phoneCheckState.isValid !== true) {
        throw new Error(phoneCheckState.message || '전화번호를 확인해주세요.');
      }

      // 회원가입 요청
      const response = await api.post('/auth/register/teacher', {
        username: data.username,
        password: data.password,
        name: data.name,
        phoneNumber: data.phoneNumber,
        discordId: data.discordId || null
      });

      if (!response.data.success) {
        throw new Error(response.data.message || '회원가입에 실패했습니다.');
      }

      return response.data;
    },
    messages: {
      successTitle: "회원가입 완료",
      successDescription: "회원가입이 완료되었습니다! 관리자의 승인을 기다려주세요.",
      errorTitle: "회원가입 실패"
    },
    redirect: {
      path: '/login',
      delay: 2000
    },
    onBeforeSubmit: async (data) => {
      // 폼 검증
      if (!form.validate()) {
        throw new Error("입력 정보를 확인해주세요.");
      }

      // 전화번호 검증
      if (!data.phoneNumber.trim()) {
        throw new Error("전화번호를 입력해주세요.");
      }

      if (!phoneNumber.isValid) {
        throw new Error("올바른 전화번호 형식을 입력해주세요.");
      }
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // 비밀번호 강도 체크 (기존 로직 유지)
  useEffect(() => {
    const password = form.values.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [form.values.password]);

  // 실시간 사용자명 중복 확인
  useEffect(() => {
    const username = form.values.username;
    
    if (!username || username.length < 4) {
      setUsernameCheckState({
        isChecking: false,
        isValid: null,
        message: ''
      });
      return;
    }

    // 클라이언트 측 검증 먼저 수행
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameCheckState({
        isChecking: false,
        isValid: false,
        message: '영문자, 숫자, 언더바만 사용 가능합니다.'
      });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUsernameCheckState(prev => ({ ...prev, isChecking: true }));
      
      try {
        const result = await authService.checkUsername(username);
        setUsernameCheckState({
          isChecking: false,
          isValid: result.success && result.data,
          message: result.success && result.data 
            ? '사용 가능한 사용자명입니다.' 
            : result.message || '이미 사용 중인 사용자명입니다.'
        });
      } catch (error) {
        setUsernameCheckState({
          isChecking: false,
          isValid: false,
          message: '사용자명 확인 중 오류가 발생했습니다.'
        });
      }
    }, 500); // 500ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [form.values.username]);

  // 실시간 전화번호 중복 확인
  useEffect(() => {
    const phone = phoneNumber.value;
    
    if (!phone || !phoneNumber.isValid) {
      setPhoneCheckState({
        isChecking: false,
        isValid: null,
        message: ''
      });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setPhoneCheckState(prev => ({ ...prev, isChecking: true }));
      
      try {
        const result = await authService.checkPhoneNumber(phone);
        setPhoneCheckState({
          isChecking: false,
          isValid: result.success && result.data,
          message: result.success && result.data 
            ? '사용 가능한 전화번호입니다.' 
            : result.message || '이미 등록된 전화번호입니다.'
        });
      } catch (error) {
        setPhoneCheckState({
          isChecking: false,
          isValid: false,
          message: '전화번호 확인 중 오류가 발생했습니다.'
        });
      }
    }, 500); // 500ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [phoneNumber.value, phoneNumber.isValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // useAsyncForm으로 제출 (검증 포함)
    const submitData = {
      ...form.values,
      phoneNumber: phoneNumber.value
    };

    try {
      await asyncForm.submit(submitData);
    } catch (error) {
      // 에러는 useAsyncForm에서 자동 처리됨
      console.error('Form submission error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isPasswordValid = () => {
    return passwordStrength.hasMinLength && 
           passwordStrength.hasLetter && 
           passwordStrength.hasNumber && 
           passwordStrength.hasSpecial;
  };

  const passwordsMatch = () => {
    return form.values.password === form.values.confirmPassword && form.values.confirmPassword !== '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">CheckUS</h1>
          <p className="text-sm text-blue-600 mt-1">선생님 회원가입</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-blue-700">회원가입</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 아이디 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <div className="relative">
                  <Input
                    id="username"
                    {...form.getFieldProps('username')}
                    placeholder="4-20자, 영문자/숫자/언더바만 가능"
                    className={cn(
                      "pr-10",
                      form.errors.username && "border-red-500",
                      usernameCheckState.isValid === false && "border-red-500",
                      usernameCheckState.isValid === true && "border-green-500"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameCheckState.isChecking ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    ) : usernameCheckState.isValid === true ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : usernameCheckState.isValid === false ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {form.errors.username && (
                  <p className="text-sm text-red-500">{form.errors.username}</p>
                )}
                {!form.errors.username && usernameCheckState.message && (
                  <p className={`text-sm ${usernameCheckState.isValid ? 'text-green-600' : 'text-red-500'}`}>
                    {usernameCheckState.message}
                  </p>
                )}
              </div>

              {/* 비밀번호 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    {...form.getFieldProps('password')}
                    type={showPassword ? "text" : "password"}
                    placeholder="8자 이상, 영문자+숫자+특수문자 포함"
                    className={cn(
                      "pr-10",
                      (form.errors.password || (!passwordStrength.hasMinLength && form.values.password)) && "border-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.errors.password && (
                  <p className="text-sm text-red-500">{form.errors.password}</p>
                )}
                {form.values.password && (
                  <div className="text-xs space-y-1">
                      <div className={cn(
                      "flex items-center gap-1",
                      passwordStrength.hasMinLength ? "text-green-600" : "text-red-500"
                      )}>
                      {passwordStrength.hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      8자 이상
                      </div>
                      <div className={cn(
                      "flex items-center gap-1",
                      passwordStrength.hasLetter ? "text-green-600" : "text-red-500"
                      )}>
                      {passwordStrength.hasLetter ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      영문자 포함
                      </div>
                      <div className={cn(
                      "flex items-center gap-1",
                      passwordStrength.hasNumber ? "text-green-600" : "text-red-500"
                      )}>
                      {passwordStrength.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      숫자 포함
                      </div>
                      <div className={cn(
                      "flex items-center gap-1",
                      passwordStrength.hasSpecial ? "text-green-600" : "text-red-500"
                      )}>
                      {passwordStrength.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      특수문자 포함
                    </div>
                  </div>
                )}
              </div>

              {/* 비밀번호 확인 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    {...form.getFieldProps('confirmPassword')}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    className={cn(
                      "pr-10",
                      (form.errors.confirmPassword || (form.values.confirmPassword && !passwordsMatch())) && "border-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{form.errors.confirmPassword}</p>
                )}
                {form.values.confirmPassword && (
                  <div className={cn(
                    "text-xs flex items-center gap-1",
                    passwordsMatch() ? "text-green-600" : "text-red-500"
                  )}>
                    {passwordsMatch() ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {passwordsMatch() ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
                  </div>
                )}
              </div>

              {/* 이름 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  {...form.getFieldProps('name')}
                  placeholder="이름을 입력하세요"
                  className={form.errors.name ? 'border-red-500' : ''}
                />
                {form.errors.name && (
                  <p className="text-sm text-red-500">{form.errors.name}</p>
                )}
              </div>

              {/* 전화번호 필드 - 기존 usePhoneNumberInput 사용 */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">전화번호</Label>
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phoneNumber.value}
                    onChange={phoneNumber.onChange}
                    className={cn(
                      "pr-10",
                      !phoneNumber.isValid && phoneNumber.value.length > 3 && "border-red-500",
                      phoneCheckState.isValid === false && "border-red-500",
                      phoneCheckState.isValid === true && "border-green-500"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {phoneCheckState.isChecking ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    ) : phoneCheckState.isValid === true ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : phoneCheckState.isValid === false ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">010으로 시작하며 자동으로 하이픈이 추가됩니다</p>
                  {phoneNumber.value.length > 3 && !phoneCheckState.message && (
                    <p className={`text-xs ${phoneNumber.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {phoneNumber.isValid ? '✓ 올바른 형식' : '✗ 잘못된 형식'}
                    </p>
                  )}
                </div>
                {phoneCheckState.message && (
                  <p className={`text-sm ${phoneCheckState.isValid ? 'text-green-600' : 'text-red-500'}`}>
                    {phoneCheckState.message}
                  </p>
                )}
              </div>

              {/* 디스코드 ID 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="discordId">디스코드 ID (선택)</Label>
                <Input
                  id="discordId"
                  {...form.getFieldProps('discordId')}
                  placeholder="username#1234"
                  className={form.errors.discordId ? 'border-red-500' : ''}
                />
                {form.errors.discordId && (
                  <p className="text-sm text-red-500">{form.errors.discordId}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              {/* 에러/성공 메시지는 useAsyncForm에서 자동 toast로 처리됨 */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={asyncForm.isSubmitting || !form.isValid || !phoneNumber.isValid || !isPasswordValid() || !passwordsMatch() || usernameCheckState.isValid !== true || phoneCheckState.isValid !== true}
              >
                {asyncForm.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    가입 중...
                  </>
                ) : (
                  '회원가입'
                )}
              </Button>
              <div className="text-center text-sm">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:underline"
                  disabled={asyncForm.isSubmitting}
                >
                  로그인
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register; 