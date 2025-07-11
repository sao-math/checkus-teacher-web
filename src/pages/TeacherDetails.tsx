import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Mail, Users, School, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherDetailResponse } from '@/types/teacher';
import { teacherApi } from '@/services/teacherApi';
import { useToast } from '@/hooks/use-toast';
import { FullScreenLoadingSpinner } from '@/components/ui/LoadingSpinner';

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const { toast } = useToast();
  const isProfile = !id || id === 'profile';
  
  const [teacher, setTeacher] = useState<TeacherDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (isProfile && user) {
        // For profile view, use current user data
        // Note: You might need to create a separate API endpoint for current teacher profile
        // For now, we'll fetch using the current user's ID if available
        if (user.data.id) {
          try {
            setLoading(true);
            const data = await teacherApi.getTeacherDetail(Number(user.data.id));
            setTeacher(data);
          } catch (error) {
            console.error('Error fetching teacher profile:', error);
            toast({
              title: "오류",
              description: "프로필 정보를 불러오는데 실패했습니다.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        }
      } else if (id && !isProfile) {
        // For teacher details view, fetch specific teacher data
        try {
          setLoading(true);
          const data = await teacherApi.getTeacherDetail(Number(id));
          setTeacher(data);
        } catch (error) {
          console.error('Error fetching teacher details:', error);
          toast({
            title: "오류",
            description: "교사 정보를 불러오는데 실패했습니다.",
            variant: "destructive",
          });
          navigate('/teachers');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTeacherData();
  }, [id, isProfile, user, navigate, toast]);

  if (authLoading || loading) {
    return <FullScreenLoadingSpinner text="로딩 중..." />;
  }

  if (isProfile && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{authError || '사용자 정보를 불러올 수 없습니다.'}</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">교사 정보를 찾을 수 없습니다.</p>
          <Button onClick={() => navigate('/teachers')} className="mt-4">
            교사 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '재직중';
      case 'SUSPENDED': return '정지됨';
      default: return '알 수 없음';
    }
  };

  const handleBack = () => {
    navigate(isProfile ? '/dashboard' : '/teachers');
  };

  const handleEdit = () => {
    navigate(isProfile ? '/profile/edit' : `/teachers/${id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isProfile ? '내 계정 관리' : '선생님 정보'}
                </h1>
                <p className="text-sm text-gray-500">
                  {teacher.name}의 정보를 확인하고 관리할 수 있습니다
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              정보 수정
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 기본 정보 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {teacher.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{teacher.name}</h2>
                  <p className="text-sm text-gray-500">@{teacher.username}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(teacher.status)}>
                  {getStatusText(teacher.status)}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{teacher.phoneNumber}</span>
                </div>
                {teacher.discordId && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{teacher.discordId}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <School className="h-4 w-4" />
                  <span>가입일: {new Date(teacher.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 담당 반 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                담당 반
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.classes && teacher.classes.length > 0 ? (
                <div className="space-y-3">
                  {teacher.classes.map((classInfo) => (
                    <div key={classInfo.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900">{classInfo.name}</div>
                      <div className="text-sm text-gray-500">
                        학생 수: {classInfo.studentCount}명
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">담당 반이 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails; 