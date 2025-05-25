import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between border-b">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          {user.name} ({user.role === 'admin' ? '관리자' : '선생님'})
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          leftIcon={<User size={16} />}
          onClick={handleProfile}
        >
          내 계정
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          leftIcon={<LogOut size={16} />}
        >
          로그아웃
        </Button>
      </div>
    </header>
  );
};

export default Header;