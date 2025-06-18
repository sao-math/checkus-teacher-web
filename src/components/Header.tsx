import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userName = user?.data?.name || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-gray-600 hover:text-blue-600" />
        <h1 
          className="text-xl font-bold text-blue-900 cursor-pointer hover:text-blue-700 transition-colors"
          onClick={() => navigate('/dashboard')}
        >
          CHECK US
        </h1>
      </div>
      
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-700">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
              <span>내 계정 관리</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-red-50 text-red-600" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
