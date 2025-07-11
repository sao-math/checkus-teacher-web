import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Users, Trash2, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from '@/hooks/useForm';
import { useAsyncForm } from '@/hooks/useAsyncForm';
import { Class } from '@/types/class';
import { mockClasses } from '@/data/mockClasses';
import { mockTeachers } from '@/data/mockTeachers';
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
import { ButtonLoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ClassFormData {
  name: string;
  teacherId: string;
  maxStudents: string;
  schedule: string;
  description: string;
  status: 'active' | 'inactive';
}

const ClassForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  // useForm 훅으로 폼 상태 관리 통합
  const form = useForm<ClassFormData>({
    initialValues: {
      name: '',
      teacherId: '',
      maxStudents: '',
      schedule: '',
      description: '',
      status: 'active'
    },
    fields: {
      name: {
        validation: {
          required: true,
          minLength: 1,
          maxLength: 100,
          custom: (value: string) => {
            if (value && !value.trim()) {
              return '반 이름을 입력해주세요.';
            }
            return null;
          }
        }
      },
      teacherId: {
        validation: {
          required: true,
          custom: (value: string) => {
            if (!value) {
              return '담당 선생님을 선택해주세요.';
            }
            return null;
          }
        }
      },
      maxStudents: {
        validation: {
          custom: (value: string) => {
            if (value && (isNaN(Number(value)) || Number(value) < 0)) {
              return '올바른 학생 수를 입력해주세요.';
            }
            return null;
          }
        }
      },
      schedule: {
        validation: {
          maxLength: 200
        }
      },
      description: {
        validation: {
          maxLength: 500
        }
      }
    }
  });

  // useAsyncForm 훅으로 비동기 제출 로직 통합
  const asyncForm = useAsyncForm<ClassFormData, any>({
    onSubmit: async (data) => {
      // Mock API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 실제로는 여기서 API 호출을 수행
      // const response = await classApi.createClass(data) 또는 classApi.updateClass(id, data)
      
      return { success: true, data };
    },
    messages: {
      successTitle: isEdit ? "반 정보 수정 완료" : "반 등록 완료",
      successDescription: (data) => `${data.name}의 정보가 성공적으로 ${isEdit ? '수정' : '등록'}되었습니다.`,
      errorTitle: isEdit ? "수정 실패" : "등록 실패",
      errorDescription: "반 정보 처리에 실패했습니다. 다시 시도해주세요."
    },
    redirect: {
      path: '/classes'
    },
    onBeforeSubmit: async (data) => {
      // 폼 검증
      if (!form.validate()) {
        throw new Error("입력 정보를 확인해주세요.");
      }
    }
  });

  useEffect(() => {
    if (isEdit && id) {
      const existingClass = mockClasses.find(cls => cls.id === parseInt(id));
      if (existingClass) {
        const teacher = mockTeachers.find(t => t.name === existingClass.teacher);
        form.setValues({
          name: existingClass.name,
          teacherId: teacher ? teacher.id.toString() : '',
          maxStudents: existingClass.maxStudents?.toString() || '',
          schedule: existingClass.schedule || '',
          description: existingClass.description || '',
          status: existingClass.status
        });
      }
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await asyncForm.submit(form.values);
    } catch (error) {
      // 에러는 useAsyncForm에서 자동 처리됨
      console.error('Form submission error:', error);
    }
  };

  const handleDelete = () => {
    toast({
      title: "반 삭제",
      description: `${form.values.name}이(가) 삭제되었습니다.`,
      variant: "destructive",
    });

    navigate('/classes');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/classes')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEdit ? '반 정보 수정' : '새 반 등록'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? `${form.values.name}의 정보를 수정합니다` : '새로운 반을 등록합니다'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                      disabled={asyncForm.isSubmitting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {form.values.name}의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800">
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button 
                onClick={handleSubmit} 
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
                disabled={asyncForm.isSubmitting || !form.isValid}
              >
                {asyncForm.isSubmitting ? (
                  <ButtonLoadingSpinner size="sm" text="저장 중..." />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* 반 이름 필드 - useForm 사용 */}
                  <div>
                    <Label htmlFor="name">반 이름 *</Label>
                    <Input
                      id="name"
                      {...form.getFieldProps('name')}
                      placeholder="반 이름을 입력하세요"
                      className={form.errors.name ? 'border-red-500' : ''}
                    />
                    {form.errors.name && (
                      <p className="text-sm text-red-500 mt-1">{form.errors.name}</p>
                    )}
                  </div>

                  {/* 담당 선생님 필드 - useForm 사용 */}
                  <div>
                    <Label htmlFor="teacher">담당 선생님 *</Label>
                    <Select 
                      value={form.values.teacherId} 
                      onValueChange={(value) => form.setFieldValue('teacherId', value)}
                    >
                      <SelectTrigger className={form.errors.teacherId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="담당 선생님을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTeachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.errors.teacherId && (
                      <p className="text-sm text-red-500 mt-1">{form.errors.teacherId}</p>
                    )}
                  </div>

                  {/* 최대 학생 수 필드 - useForm 사용 */}
                  <div>
                    <Label htmlFor="maxStudents">최대 학생 수</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      {...form.getFieldProps('maxStudents')}
                      placeholder="최대 학생 수를 입력하세요"
                      className={form.errors.maxStudents ? 'border-red-500' : ''}
                    />
                    {form.errors.maxStudents && (
                      <p className="text-sm text-red-500 mt-1">{form.errors.maxStudents}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 추가 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  추가 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* 수업 일정 필드 - useForm 사용 */}
                  <div>
                    <Label htmlFor="schedule">수업 일정</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="schedule"
                        {...form.getFieldProps('schedule')}
                        placeholder="수업 일정을 입력하세요"
                        className={`pl-9 ${form.errors.schedule ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {form.errors.schedule && (
                      <p className="text-sm text-red-500 mt-1">{form.errors.schedule}</p>
                    )}
                  </div>

                  {/* 설명 필드 - useForm 사용 */}
                  <div>
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={form.values.description}
                      onChange={(e) => form.setFieldValue('description', e.target.value)}
                      onBlur={(e) => form.setFieldTouched('description', true)}
                      placeholder="반에 대한 설명을 입력하세요"
                      className={`h-24 ${form.errors.description ? 'border-red-500' : ''}`}
                    />
                    {form.errors.description && (
                      <p className="text-sm text-red-500 mt-1">{form.errors.description}</p>
                    )}
                  </div>

                  {/* 상태 필드 - useForm 사용 */}
                  <div>
                    <Label htmlFor="status">상태 *</Label>
                    <Select 
                      value={form.values.status} 
                      onValueChange={(value) => form.setFieldValue('status', value as 'active' | 'inactive')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="상태를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="inactive">비활성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
