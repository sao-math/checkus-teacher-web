import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  BookOpen, 
  CheckSquare, 
  TrendingUp, 
  UserCheck, 
  School,
  User
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Handle error messages from navigation
  useEffect(() => {
    if (location.state?.error) {
      toast({
        title: "접근 제한",
        description: location.state.error,
        variant: "destructive",
      });
      // Clear the error from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, toast, navigate, location.pathname]);

  // Check if user is admin
  const isAdmin = user?.data?.roles?.some(role => 
    role.toUpperCase() === 'ADMIN'
  ) || false;

  const menuItems = [
    {
      title: '사용자 정보',
      description: '내 프로필 정보를 확인하고 관리하세요',
      icon: User,
      path: '/profile',
      color: 'bg-slate-300 hover:bg-slate-400 text-gray-800',
      adminOnly: false
    },
    {
      title: '학생 관리',
      description: '학생 정보를 관리하고 출석을 확인하세요',
      icon: BookOpen,
      path: '/students',
      color: 'bg-slate-400 hover:bg-slate-500 text-gray-800',
      adminOnly: false
    },
    {
      title: '반 관리',
      description: '반 편성과 반별 정보를 관리하세요',
      icon: Users,
      path: '/classes',
      color: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
      adminOnly: false
    },
    {
      title: '스터디 모니터링',
      description: '실시간으로 학생들의 학습 현황을 모니터링하세요',
      icon: TrendingUp,
      path: '/monitoring',
      color: 'bg-gray-400 hover:bg-gray-500 text-gray-800',
      adminOnly: false
    },
    {
      title: '할일 관리',
      description: '과제와 할일을 생성하고 관리하세요',
      icon: CheckSquare,
      path: '/tasks',
      color: 'bg-zinc-300 hover:bg-zinc-400 text-gray-800',
      adminOnly: false
    },
    {
      title: '선생님 관리',
      description: '교사 계정과 권한을 관리하세요',
      icon: UserCheck,
      path: '/teachers',
      color: 'bg-zinc-400 hover:bg-zinc-500 text-gray-800',
      adminOnly: true
    },
    {
      title: '학교 관리',
      description: '학교 정보와 설정을 관리하세요',
      icon: School,
      path: '/schools',
      color: 'bg-stone-300 hover:bg-stone-400 text-gray-800',
      adminOnly: true
    }
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    !item.adminOnly || isAdmin
  );

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-2">CheckUS 교사 관리 시스템에 오신 것을 환영합니다.</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          {user?.data ? (
            <div className="space-y-2">
              <p><strong>이름:</strong> {user.data.name}</p>
              <p><strong>사용자명:</strong> {user.data.username}</p>
              <p><strong>전화번호:</strong> {user.data.phoneNumber}</p>
              <p><strong>디스코드 ID:</strong> {user.data.discordId || '미설정'}</p>
              <p><strong>역할:</strong> {user.data.roles?.join(', ')}</p>
            </div>
          ) : (
            <p>사용자 정보를 불러오는 중...</p>
          )}
        </CardContent>
      </Card>

      {/* Menu Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>메뉴 바로가기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleMenuItems.map((item, index) => (
              <Button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`h-20 p-3 ${item.color} flex flex-col items-center justify-center space-y-1 hover:shadow-md transition-all duration-200`}
              >
                <item.icon className="h-6 w-6" />
                <div className="text-center">
                  <h3 className="font-medium text-xs">{item.title}</h3>
                  <p className="text-xs opacity-75 mt-0.5 leading-tight">{item.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
