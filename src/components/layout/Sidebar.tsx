import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, BookOpen, CheckSquare, UserCog, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    {
      title: '반 관리',
      path: '/classes',
      icon: <BookOpen size={20} />,
      show: true,
    },
    {
      title: '학생 관리',
      path: '/students',
      icon: <Users size={20} />,
      show: true,
    },
    {
      title: '할일 DB 관리',
      path: '/todos',
      icon: <CheckSquare size={20} />,
      show: true,
    },
    {
      title: '선생님 관리',
      path: '/teachers',
      icon: <UserCog size={20} />,
      show: user.role === 'admin',
    },
  ];

  return (
    <div className="h-full w-64 bg-gray-600 text-gray-100 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">선생님 포털</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems
            .filter(item => item.show)
            .map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-white/10 text-white font-medium shadow-inner'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <Link
          to="/profile"
          className={`
            flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200
            ${isActive('/profile')
              ? 'bg-white/10 text-white font-medium shadow-inner'
              : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
          `}
        >
          <span className="mr-3"><User size={20} /></span>
          <span>내 계정</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;