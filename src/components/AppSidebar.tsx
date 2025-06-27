import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Users, BookOpen, CheckSquare, Settings, Monitor, School } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    title: '반 관리',
    url: '/classes',
    icon: BookOpen,
  },
  {
    title: '학생 관리',
    url: '/students',
    icon: Users,
  },
  {
    title: '스터디 모니터링',
    url: '/monitoring',
    icon: Monitor,
  },
  {
    title: '할일 DB 관리',
    url: '/tasks',
    icon: CheckSquare,
  },
];

const adminMenuItems = [
  {
    title: '선생님 관리',
    url: '/teachers',
    icon: Settings,
  },
  {
    title: '학교 관리',
    url: '/schools',
    icon: School,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if user has ADMIN role
  const isAdmin = user?.data?.roles?.some(role => 
    role.toUpperCase() === 'ADMIN'
  ) || false;

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
            메인 메뉴
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname.startsWith(item.url)}
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
              관리자 메뉴
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname.startsWith(item.url)}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-700">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
