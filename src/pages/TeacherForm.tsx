import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi, TeacherDetailResponse, TeacherUpdateRequest } from '@/services/adminApi';
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
} from "@/components/ui/alert-dialog";

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [teacher, setTeacher] = useState<TeacherDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    discordId: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchTeacherDetail(parseInt(id));
    }
  }, [id, isEdit]);

  const fetchTeacherDetail = async (teacherId: number) => {
    try {
      setLoading(true);
      const data = await adminApi.getTeacherDetail(teacherId);
      setTeacher(data);
      setFormData({
        name: data.name,
        phoneNumber: data.phoneNumber || '',
        discordId: data.discordId || ''
      });
    } catch (error) {
      console.error('Failed to fetch teacher detail:', error);
      toast({
        title: '오류',
        description: '교사 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      navigate('/teachers');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "입력 오류",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      toast({
        title: "입력 오류",
        description: "전화번호를 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }

    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]-[0-9]{4}-[0-9]{4}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast({
        title: "입력 오류",
        description: "올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!isEdit || !id) {
      toast({
        title: "오류",
        description: "수정할 교사 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const updateData: TeacherUpdateRequest = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        discordId: formData.discordId.trim() || undefined
      };

      await adminApi.updateTeacher(parseInt(id), updateData);
      
      toast({
        title: "교사 정보 수정 완료",
        description: `${formData.name} 교사의 정보가 성공적으로 수정되었습니다.`,
      });

      navigate(`/teachers/${id}`);
    } catch (error) {
      console.error('Failed to update teacher:', error);
      toast({
        title: "수정 실패",
        description: "교사 정보 수정에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!teacher) return;

    try {
      setDeleting(true);
      await adminApi.deleteTeacher(teacher.id);
      
      toast({
        title: "교사 삭제",
        description: `${teacher.name} 교사가 삭제되었습니다.`,
        variant: "destructive",
      });

      navigate('/teachers');
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      toast({
        title: "삭제 실패",
        description: "교사 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isEdit && !teacher) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/teachers')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEdit ? '교사 정보 수정' : '새 교사 등록'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? `${formData.name} 교사의 정보를 수정합니다` : '새로운 교사를 등록합니다'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleting ? '삭제 중...' : '삭제'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {formData.name} 교사의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
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
              <Button onClick={handleSubmit} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-5 w-5" />
                교사 기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 기본 정보 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">기본 정보</h3>
                  <div className="space-y-4">
                    {isEdit && teacher && (
                      <div className="space-y-2">
                        <Label htmlFor="username">사용자명</Label>
                        <Input
                          id="username"
                          value={teacher.username}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">사용자명은 변경할 수 없습니다.</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">이름 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="교사 이름을 입력하세요"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">전화번호 *</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        placeholder="010-1234-5678"
                        required
                      />
                      <p className="text-xs text-gray-500">형식: 010-1234-5678</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discordId">Discord ID</Label>
                      <Input
                        id="discordId"
                        value={formData.discordId}
                        onChange={(e) => handleChange('discordId', e.target.value)}
                        placeholder="username#1234"
                      />
                      <p className="text-xs text-gray-500">선택사항입니다.</p>
                    </div>
                  </div>
                </div>

                {/* 상태 정보 (읽기 전용) */}
                {isEdit && teacher && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">계정 정보</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>현재 상태</Label>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            teacher.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                            teacher.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {teacher.status === 'ACTIVE' ? '활성' : 
                             teacher.status === 'SUSPENDED' ? '정지' : teacher.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>가입일</Label>
                        <div className="p-2 bg-gray-50 rounded-md text-sm">
                          {new Date(teacher.createdAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>담당 반</Label>
                        <div className="p-2 bg-gray-50 rounded-md text-sm">
                          {teacher.classes.length > 0 ? (
                            <div className="space-y-1">
                              {teacher.classes.map((cls) => (
                                <div key={cls.id}>{cls.name}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">담당 반 없음</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm; 