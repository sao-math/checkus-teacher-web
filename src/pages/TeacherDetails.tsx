import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Mail, Users, School, Edit, Trash2, BookOpen, MessageCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { adminApi, TeacherDetailResponse } from '@/services/adminApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading, error } = useAuth();
  const { toast } = useToast();
  const isProfile = !id || id === 'profile';

  const [teacher, setTeacher] = useState<TeacherDetailResponse | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    console.log('TeacherDetails mounted');
    console.log('id:', id);
    console.log('isProfile:', isProfile);
    console.log('user:', user);
    console.log('isLoading:', isLoading);
    console.log('error:', error);

    if (!isProfile && id) {
      fetchTeacherDetail(parseInt(id));
    }
  }, [id, isProfile, user, isLoading, error]);

  const fetchTeacherDetail = async (teacherId: number) => {
    try {
      setTeacherLoading(true);
      const data = await adminApi.getTeacherDetail(teacherId);
      setTeacher(data);
    } catch (error) {
      console.error('Failed to fetch teacher detail:', error);
      toast({
        title: '오류',
        description: '교사 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!teacher) return;

    try {
      setDeleting(true);
      await adminApi.deleteTeacher(teacher.id);
      toast({
        title: '성공',
        description: '교사가 성공적으로 삭제되었습니다.',
      });
      navigate('/teachers');
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      toast({
        title: '오류',
        description: '교사 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'RESIGNED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return '재직중';
      case 'PENDING': return '승인대기';
      case 'SUSPENDED': return '정지';
      case 'RESIGNED': return '퇴직';
      default: return '알 수 없음';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    navigate(isProfile ? '/dashboard' : '/teachers');
  };

  const handleEdit = () => {
    navigate(isProfile ? '/profile/edit' : `/teachers/${id}/edit`);
  };

  if (isLoading || teacherLoading) {
    console.log('Rendering loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isProfile && !user) {
    console.log('Rendering error state - no user data');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{error || '사용자 정보를 불러올 수 없습니다.'}</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (!isProfile && !teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">교사 정보를 찾을 수 없습니다.</p>
          <Button onClick={() => navigate('/teachers')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  console.log('Rendering main content');
  
  // Profile mode uses user data, otherwise use fetched teacher data
  const displayTeacher = isProfile && user ? {
    id: Number(user.data.id),
    username: user.data.username,
    name: user.data.name,
    phoneNumber: user.data.phoneNumber || '',
    discordId: user.data.discordId || undefined,
    createdAt: user.data.createdAt || new Date().toISOString(),
    status: 'ACTIVE',
    classes: [] // TODO: Get classes from API
  } : teacher;

  if (!displayTeacher) return null;

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
                  {displayTeacher.name}의 정보를 확인하고 관리할 수 있습니다
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                정보 수정
              </Button>
              {!isProfile && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>교사 삭제 확인</AlertDialogTitle>
                      <AlertDialogDescription>
                        정말로 <strong>{displayTeacher.name}</strong> 교사를 삭제하시겠습니까?
                        <br />
                        이 작업은 되돌릴 수 없으며, 교사 역할이 비활성화됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? '삭제 중...' : '삭제'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {displayTeacher.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">{displayTeacher.name}</h2>
                    <p className="text-sm text-gray-500">@{displayTeacher.username}</p>
                  </div>
                </CardTitle>
                <Badge className={getStatusColor(displayTeacher.status)}>
                  {getStatusText(displayTeacher.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{displayTeacher.phoneNumber || '정보 없음'}</span>
                  </div>
                  {displayTeacher.discordId && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="h-4 w-4" />
                      <span>{displayTeacher.discordId}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>가입일: {formatDate(displayTeacher.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 담당 반 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                담당 반 정보
                <Badge variant="secondary">{displayTeacher.classes?.length || 0}개 반</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayTeacher.classes && displayTeacher.classes.length > 0 ? (
                <div className="grid gap-4">
                  {displayTeacher.classes.map((classInfo, index) => (
                    <div key={classInfo.id}>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-lg">{classInfo.name}</h3>
                          <p className="text-sm text-gray-600">반 ID: {classInfo.id}</p>
                        </div>
                        {'studentCount' in classInfo && (
                          <div className="text-right">
                            <p className="text-lg font-semibold text-blue-600">
                              {classInfo.studentCount}명
                            </p>
                            <p className="text-sm text-gray-500">학생 수</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>담당 중인 반이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails; 