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
import authService from '@/services/auth';
import api from '@/lib/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phoneNumber: '',
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

  useEffect(() => {
    if (!formData.phoneNumber) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: '010'
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (name === 'phoneNumber') {
      // Remove all non-digit characters
      const numbers = value.replace(/\D/g, '');
      
      // If empty, return just '010'
      if (numbers.length === 0) {
        setFormData(prev => ({ ...prev, phoneNumber: '010' }));
        return;
      }
      
      // Format the number with hyphens
      let formatted = '010';
      const remainingNumbers = numbers.slice(3); // Skip the first 3 digits (010)
      
      if (remainingNumbers.length > 0) {
        formatted += '-' + remainingNumbers.slice(0, 4);
        if (remainingNumbers.length > 4) {
          formatted += '-' + remainingNumbers.slice(4, 8);
        }
      }
      setFormData(prev => ({ ...prev, phoneNumber: formatted }));
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
    if (!formData.phoneNumber.trim()) return '전화번호를 입력해주세요.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check username availability
      const usernameCheck = await authService.checkUsername(formData.username);
      if (!usernameCheck.success || !usernameCheck.data) {
        throw new Error('이미 사용 중인 사용자명입니다.');
      }

      // Check phone number availability
      const phoneCheck = await authService.checkPhoneNumber(formData.phoneNumber);
      if (!phoneCheck.success || !phoneCheck.data) {
        throw new Error('이미 등록된 전화번호입니다.');
      }

      // Validate form
      const validationError = validate();
      if (validationError) {
        throw new Error(validationError);
      }

      // Register
      const response = await api.post('/auth/register/teacher', {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        discordId: formData.discordId
      });

      if (response.data.success) {
        navigate('/login', { 
          state: { 
            message: '회원가입이 완료되었습니다. 로그인해주세요.',
            from: 'registration'
          } 
        });
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

  const passwordsMatch = formData.password === confirmPassword;

  const isPhoneNumberValid = () => {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(formData.phoneNumber);
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
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 mb-1">비밀번호는 다음 조건을 만족해야 합니다:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div className={cn(
                        "text-xs flex items-center gap-1",
                        passwordStrength.hasLetter ? "text-green-600" : "text-gray-500"
                      )}>
                        {passwordStrength.hasLetter ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} 영문자 포함
                      </div>
                      <div className={cn(
                        "text-xs flex items-center gap-1",
                        passwordStrength.hasNumber ? "text-green-600" : "text-gray-500"
                      )}>
                        {passwordStrength.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} 숫자 포함
                      </div>
                      <div className={cn(
                        "text-xs flex items-center gap-1",
                        passwordStrength.hasSpecial ? "text-green-600" : "text-gray-500"
                      )}>
                        {passwordStrength.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} 특수문자 포함
                      </div>
                      <div className={cn(
                        "text-xs flex items-center gap-1",
                        passwordStrength.hasMinLength ? "text-green-600" : "text-gray-500"
                      )}>
                        {passwordStrength.hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} 8자 이상
                      </div>
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
                    placeholder="비밀번호를 한 번 더 입력해주세요"
                    value={confirmPassword}
                    onChange={handleChange}
                    className={cn(
                      "pr-10",
                      confirmPassword && !passwordsMatch && "border-red-500"
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
                    "text-xs flex items-center gap-1 mt-1",
                    passwordsMatch ? "text-green-600" : "text-red-500"
                  )}>
                    {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {passwordsMatch ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
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
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
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
            <CardFooter className="flex-col gap-3">
              {error && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded w-full">{error}</div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded w-full">{success}</div>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
                disabled={loading || !Object.values(passwordStrength).every(Boolean) || !passwordsMatch || !formData.name.trim() || !isPhoneNumberValid()}
              >
                {loading ? '가입 중...' : '회원가입'}
              </Button>
              <div className="text-sm text-center mt-2">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-700 font-medium hover:text-blue-800"
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