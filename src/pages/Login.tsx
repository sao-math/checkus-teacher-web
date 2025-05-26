import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@/App';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const passwordChecks = [
    { label: '8자 이상', valid: formData.password.length >= 8 },
    { label: '숫자 포함', valid: /[0-9]/.test(formData.password) },
    { label: '문자 포함', valid: /[a-zA-Z]/.test(formData.password) },
    { label: '특수문자 포함', valid: /[^a-zA-Z0-9]/.test(formData.password) },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegistering) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "비밀번호 불일치",
          description: "비밀번호가 일치하지 않습니다.",
          variant: "destructive",
        });
        return;
      }
      // Handle registration
      toast({
        title: "회원가입 완료",
        description: "회원가입이 완료되었습니다. 로그인해주세요.",
      });
      setIsRegistering(false);
      return;
    }

    // Handle login
    if (formData.username && formData.password) {
      login();
      navigate('/');
    } else {
      toast({
        title: "입력 오류",
        description: "아이디와 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleMode = (mode: 'login' | 'register') => {
    setIsRegistering(mode === 'register');
    setFormData({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isRegistering ? '회원가입' : '로그인'}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegistering ? '새로운 계정을 만들어주세요' : '계정에 로그인해주세요'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isRegistering && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">아이디</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="아이디를 입력하세요"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      className="pl-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
            {isRegistering && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="이름"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">아이디</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="아이디"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">전화번호</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 11) {
                          let formatted = value;
                          if (value.length > 3) {
                            formatted = value.slice(0, 3) + '-' + value.slice(3);
                          }
                          if (value.length > 7) {
                            formatted = formatted.slice(0, 8) + '-' + formatted.slice(8);
                          }
                          handleChange('phoneNumber', formatted);
                        }
                      }}
                      placeholder="010-1234-5678"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="비밀번호"
                      className="pl-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    비밀번호는 다음 조건을 만족해야 합니다:
                    <div className="grid grid-cols-2 gap-x-4 mt-1">
                      {passwordChecks.map((check) => (
                        <div key={check.label} className="flex items-center gap-2">
                          <span
                            className={
                              check.valid
                                ? 'text-green-700 font-bold transition'
                                : 'text-gray-400'
                            }
                            style={{ fontSize: '1.2em' }}
                          >
                            ✓
                          </span>
                          <span className={check.valid ? 'text-green-700 font-semibold' : 'text-gray-500'}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="비밀번호 확인"
                      className="pl-9"
                    />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800">
              {isRegistering ? '회원가입' : '로그인'}
            </Button>

            <div className="text-center space-y-2">
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => toggleMode('register')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  회원가입
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 