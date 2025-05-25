import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          비밀번호 재설정
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!submitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                <p className="mt-2 text-sm text-gray-500">
                  가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                재설정 링크 전송
              </Button>
              
              <div className="flex items-center justify-center">
                <div className="text-sm">
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    로그인으로 돌아가기
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">이메일 전송 완료</h3>
              <p className="mt-2 text-sm text-gray-500">
                {email} 주소로 비밀번호 재설정 링크를 보냈습니다. 받은 메일함을 확인해주세요.
              </p>
              <div className="mt-6">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  로그인으로 돌아가기
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;