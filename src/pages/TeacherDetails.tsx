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
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { FullScreenLoadingSpinner } from '@/components/ui/LoadingSpinner';

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
    return <FullScreenLoadingSpinner text="교사 정보를 불러오는 중..." />;
  }

  if (isProfile && !user) {
    return (
      <FullScreenLoadingSpinner text={error || '사용자 정보를 불러올 수 없습니다.'} />
    );
  }

  if (!isProfile && !teacher) {
    return (
      <FullScreenLoadingSpinner text="교사 정보를 찾을 수 없습니다." />
    );
  }

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
      <PageHeader
        title={isProfile ? '내 계정 관리' : '선생님 정보'}
        description={`${displayTeacher.name}의 정보를 확인하고 관리할 수 있습니다`}
        onBack={handleBack}
        actions={[
          {
            label: '편집',
            onClick: handleEdit,
            variant: 'outline',
            icon: <Edit className="h-4 w-4" />
          }
        ]}
      />

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
                <StatusBadge status={displayTeacher.status} type="teacher" />
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

      {/* 삭제 확인 다이얼로그 - 프로필이 아닐 때만 표시 */}
      {!isProfile && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="fixed bottom-6 right-6 shadow-lg"
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              교사 삭제
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
  );
};

export default TeacherDetails; 