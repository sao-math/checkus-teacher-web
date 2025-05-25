import React, { useState } from 'react';
import { Mail, User, Lock } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUpdateSuccess(false);
    setIsUpdating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUpdateSuccess(true);
    } catch (err) {
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordSuccess(false);
    
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('비밀번호 변경에 실패했습니다.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AppLayout title="내 계정 관리">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {updateSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            프로필이 성공적으로 업데이트되었습니다.
          </div>
        )}
        
        {passwordSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            비밀번호가 성공적으로 변경되었습니다.
          </div>
        )}
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>
          </div>
          <div className="px-6 py-5">
            <form className="space-y-6" onSubmit={handleProfileUpdate}>
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
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isUpdating}
                >
                  정보 업데이트
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mt-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">비밀번호 변경</h3>
          </div>
          <div className="px-6 py-5">
            <form className="space-y-6" onSubmit={handlePasswordChange}>
              <div>
                <Input
                  id="currentPassword"
                  label="현재 비밀번호"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  fullWidth
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                />
              </div>
              
              <div>
                <Input
                  id="newPassword"
                  label="새 비밀번호"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  fullWidth
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                />
              </div>
              
              <div>
                <Input
                  id="confirmPassword"
                  label="새 비밀번호 확인"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isChangingPassword}
                >
                  비밀번호 변경
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;