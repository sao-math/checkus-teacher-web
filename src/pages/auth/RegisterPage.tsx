import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          선생님 계정 등록
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                id="name"
                label="이름"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                leftIcon={<User className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Input
                id="email"
                label="이메일"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Input
                id="password"
                label="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
              />
            </div>
            
            <div>
              <Input
                id="passwordConfirm"
                label="비밀번호 확인"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                fullWidth
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              회원가입
            </Button>
          </form>

          <div className="mt-6">
            <div className="text-center text-sm">
              <span className="text-gray-600">이미 계정이 있으신가요? </span>
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;