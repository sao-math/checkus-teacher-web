import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePhoneNumberInput } from '@/hooks/usePhoneNumberInput';
import { useForm } from '@/hooks/useForm';
import { useAsyncForm } from '@/hooks/useAsyncForm';
import { TeacherDetailResponse, TeacherUpdateRequest } from '@/types/teacher';
import { teacherApi } from '@/services/teacherApi';
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

interface TeacherFormData {
  name: string;
  discordId: string;
}

interface TeacherSubmitData extends TeacherFormData {
  phoneNumber: string;
  id?: number;
}

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [teacher, setTeacher] = useState<TeacherDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 전화번호 입력 훅 사용
  const phoneNumber = usePhoneNumberInput({
    initialValue: '',
    startsWith010: true
  });

  // useForm 훅 사용으로 폼 상태 관리 통합
  const form = useForm<TeacherFormData>({
    initialValues: {
    name: '',
      discordId: ''
    },
    fields: {
      name: {
        validation: {
          required: true,
          minLength: 1,
          maxLength: 50,
          custom: (value: string) => {
            if (value && !value.trim()) {
              return '이름을 입력해주세요.';
            }
            return null;
          }
        }
      },
      discordId: {
        validation: {
          maxLength: 100
        }
      }
    }
  });

  // useAsyncForm 훅으로 비동기 제출 로직 통합
  const asyncForm = useAsyncForm<TeacherSubmitData, any>({
    onSubmit: async (data) => {
      if (!isEdit || !id) {
        throw new Error("수정할 교사 정보를 찾을 수 없습니다.");
      }

      const updateData: TeacherUpdateRequest = {
        name: data.name.trim(),
        phoneNumber: data.phoneNumber.trim(),
        discordId: data.discordId.trim() || undefined
      };

      return await teacherApi.updateTeacher(parseInt(id), updateData);
    },
    messages: {
      successTitle: "교사 정보 수정 완료",
      successDescription: (data) => `${data.name} 교사의 정보가 성공적으로 수정되었습니다.`,
      errorTitle: "수정 실패",
      errorDescription: "교사 정보 수정에 실패했습니다. 다시 시도해주세요."
    },
    redirect: {
      path: id ? `/teachers/${id}` : '/teachers'
    },
    onBeforeSubmit: async (data) => {
      // 폼 검증을 여기서 수행
      if (!form.validate()) {
        throw new Error("입력 정보를 확인해주세요.");
      }

      if (!data.phoneNumber.trim()) {
        throw new Error("전화번호를 입력해주세요.");
      }

      if (!phoneNumber.isValid) {
        throw new Error("올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)");
      }
    }
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchTeacherDetail(parseInt(id));
    }
  }, [id, isEdit]);

  const fetchTeacherDetail = async (teacherId: number) => {
    try {
      setLoading(true);
      const data = await teacherApi.getTeacherDetail(teacherId);
      setTeacher(data);
      
      // useForm과 usePhoneNumberInput에 데이터 설정
      form.setValues({
        name: data.name,
        discordId: data.discordId || ''
      });
      phoneNumber.setValue(data.phoneNumber || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // useAsyncForm으로 제출 (검증 포함)
    const submitData: TeacherSubmitData = {
      ...form.values,
      phoneNumber: phoneNumber.value,
      id: id ? parseInt(id) : undefined
    };

    try {
      await asyncForm.submit(submitData);
    } catch (error) {
      // 에러는 useAsyncForm에서 자동 처리됨
      console.error('Form submission error:', error);
    }
  };

  const handleDelete = async () => {
    if (!teacher) return;

    try {
      setDeleting(true);
      await teacherApi.deleteTeacher(teacher.id);
      
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
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">교사를 찾을 수 없습니다</h1>
          <p className="text-gray-500 mb-6">요청하신 교사 정보를 찾을 수 없습니다.</p>
          <Button onClick={() => navigate('/teachers')} className="bg-blue-500 hover:bg-blue-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            교사 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/teachers')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            교사 목록으로 돌아가기
              </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? '교사 정보 수정' : '새 교사 등록'}
                </h1>
          {isEdit && teacher && (
            <p className="text-gray-600 mt-2">
              {teacher.name} 교사의 정보를 수정합니다.
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isEdit ? '교사 정보 수정' : '교사 정보 입력'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이름 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  {...form.getFieldProps('name')}
                  placeholder="교사 이름을 입력하세요"
                  className={form.errors.name ? 'border-red-500' : ''}
                />
                {form.errors.name && (
                  <p className="text-sm text-red-500">{form.errors.name}</p>
                )}
              </div>

              {/* 전화번호 필드 - 기존 usePhoneNumberInput 사용 */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">전화번호 *</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber.value}
                  onChange={phoneNumber.onChange}
                  placeholder="010-0000-0000"
                  className={!phoneNumber.isValid && phoneNumber.value.length > 3 ? 'border-red-500' : ''}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">010으로 시작하며 자동으로 하이픈이 추가됩니다</p>
                  {phoneNumber.value.length > 3 && (
                    <p className={`text-xs ${phoneNumber.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {phoneNumber.isValid ? '✓ 올바른 형식' : '✗ 잘못된 형식'}
                    </p>
                  )}
                </div>
              </div>

              {/* 디스코드 ID 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="discordId">디스코드 ID (선택)</Label>
                <Input
                  id="discordId"
                  {...form.getFieldProps('discordId')}
                  placeholder="username#1234"
                  className={form.errors.discordId ? 'border-red-500' : ''}
                />
                {form.errors.discordId && (
                  <p className="text-sm text-red-500">{form.errors.discordId}</p>
                )}
                <p className="text-xs text-gray-500">
                  디스코드를 사용하여 소통하는 경우 입력해주세요
                </p>
              </div>

              <div className="flex justify-between pt-6">
                <div>
              {isEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          disabled={deleting || asyncForm.isSubmitting}
                        >
                      <Trash2 className="h-4 w-4 mr-2" />
                          교사 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                            {teacher?.name} 교사의 모든 정보가 영구적으로 삭제됩니다. 
                            이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                          >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/teachers')}
                    disabled={asyncForm.isSubmitting || deleting}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={asyncForm.isSubmitting || deleting || !form.isValid || !phoneNumber.isValid}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {asyncForm.isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEdit ? '수정 저장' : '교사 등록'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherForm; 