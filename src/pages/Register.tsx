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
import authService from '@/services/auth';
import api from '@/lib/axios';

const Register = () => {
  const navigate = useNavigate();
  
  // 전화번호 훅 사용
  const phoneNumber = usePhoneNumberInput({
    initialValue: '',
    startsWith010: true
  });

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    discordId: '',
    role: 'teacher',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSchoolSelect = (school: string) => {
    setFormData(prev => ({ ...prev, school }));
    setSchoolOpen(false);
  };

  const validate = () => {
    if (!formData.username.trim()) return '아이디를 입력해주세요.';
    if (!formData.password) return '비밀번호를 입력해주세요.';
    if (formData.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (!passwordStrength.hasLetter || !passwordStrength.hasNumber || !passwordStrength.hasSpecial) {
      return '비밀번호는 영문자, 숫자, 특수문자를 모두 포함해야 합니다.';
    }
    if (!formData.name.trim()) return '이름을 입력해주세요.';
    if (!phoneNumber.value.trim()) return '전화번호를 입력해주세요.';
    if (!phoneNumber.isValid) return '올바른 전화번호 형식을 입력해주세요.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      // Check username availability
      const usernameCheck = await authService.checkUsername(formData.username);
      if (!usernameCheck.success || !usernameCheck.data) {
        throw new Error('이미 사용 중인 사용자명입니다.');
      }

      // Check phone number availability
      const phoneCheck = await authService.checkPhoneNumber(phoneNumber.value);
      if (!phoneCheck.success || !phoneCheck.data) {
        throw new Error('이미 등록된 전화번호입니다.');
      }

      // Register
      const response = await api.post('/auth/register/teacher', {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        phoneNumber: phoneNumber.value,
        discordId: formData.discordId || null
      });

      if (response.data.success) {
        setSuccess('회원가입이 완료되었습니다! 관리자의 승인을 기다려주세요.');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (err: any) {
      // Handle both axios error responses and regular errors
      const errorMessage = err.response?.data?.message || err.message || '회원가입 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
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
    return formData.password === confirmPassword && confirmPassword !== '';
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
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="4-20자, 영문자/숫자/언더바만 가능"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="8자 이상, 영문자+숫자+특수문자 포함"
                    value={formData.password}
                    onChange={handleChange}
                    className={cn(
                      "pr-10",
                      !passwordStrength.hasMinLength && formData.password && "border-red-500"
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
                {formData.password && (
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={handleChange}
                    className={cn(
                      "pr-10",
                      confirmPassword && !passwordsMatch() && "border-red-500"
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
                {confirmPassword && (
                  <div className={cn(
                    "text-xs flex items-center gap-1",
                    passwordsMatch() ? "text-green-600" : "text-red-500"
                  )}>
                    {passwordsMatch() ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {passwordsMatch() ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">전화번호</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phoneNumber.value}
                  onChange={phoneNumber.onChange}
                  required
                  className={!phoneNumber.isValid && phoneNumber.value.length > 3 ? 'border-red-500' : ''}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">010으로 시작하며 자동으로 하이픈이 추가됩니다</p>
                  {phoneNumber.value.length > 3 && (
                    <p className={`text-xs ${phoneNumber.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {phoneNumber.isValid ? '✓ 올바른 형식' : '✗ 잘못된 형식'}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discordId">디스코드 ID (선택)</Label>
                <Input
                  id="discordId"
                  name="discordId"
                  type="text"
                  placeholder="username#1234"
                  value={formData.discordId}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              {error && (
                <div className="w-full p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="w-full p-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
                  {success}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? '가입 중...' : '회원가입'}
              </Button>
              <div className="text-center text-sm">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:underline"
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