import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, School, ChevronDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePhoneNumberInput } from '@/hooks/usePhoneNumberInput';
import { useForm } from '@/hooks/useForm';
import { useAsyncForm } from '@/hooks/useAsyncForm';
import { Student, StudentUpdateRequest } from '@/types/student';
import { studentApi } from '@/services/studentApi';
import { schoolApi, School as SchoolType } from '@/services/schoolApi';

interface StudentFormData {
  name: string;
  discordId: string;
  school: string;
  grade: number;
  status: 'INQUIRY' | 'CONSULTATION' | 'ENROLLED' | 'WAITING' | 'WITHDRAWN' | 'UNREGISTERED';
  gender: 'MALE' | 'FEMALE';
  schoolId?: number;
}

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 전화번호 훅 사용
  const phoneNumber = usePhoneNumberInput({
    initialValue: '',
    startsWith010: true
  });

  // useForm 훅으로 폼 상태 관리 통합
  const form = useForm<StudentFormData>({
    initialValues: {
      name: '',
      discordId: '',
      school: '',
      grade: 1,
      status: 'ENROLLED',
      gender: 'MALE'
    },
    fields: {
      name: {
        validation: {
          required: true,
          minLength: 1,
          maxLength: 100,
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
      },
      grade: {
        validation: {
          required: true,
          custom: (value: number) => {
            if (value < 1 || value > 13) {
              return '올바른 학년을 선택해주세요.';
            }
            return null;
          }
        }
      }
    }
  });

  // useAsyncForm 훅으로 비동기 제출 로직 통합
  const asyncForm = useAsyncForm<StudentFormData & { phoneNumber: string }, any>({
    onSubmit: async (data) => {
      if (!id) {
        throw new Error("수정할 학생 정보를 찾을 수 없습니다.");
      }

      const updateRequest: StudentUpdateRequest = {
        name: data.name.trim(),
        phoneNumber: data.phoneNumber.trim(),
        discordId: data.discordId?.trim() || undefined,
        profile: {
          status: data.status,
          schoolId: data.schoolId,
          grade: data.grade,
          gender: data.gender
        }
      };

      return await studentApi.updateStudent(parseInt(id), updateRequest);
    },
    messages: {
      successTitle: "학생 정보 수정 완료",
      successDescription: (data) => `${data.name} 학생의 정보가 성공적으로 수정되었습니다.`,
      errorTitle: "수정 실패",
      errorDescription: "학생 정보 수정에 실패했습니다. 다시 시도해주세요."
    },
    redirect: {
      path: id ? `/students/${id}` : '/students'
    },
    onBeforeSubmit: async (data) => {
      // 폼 검증
      if (!form.validate()) {
        throw new Error("입력 정보를 확인해주세요.");
      }

      // 전화번호 검증
      if (!data.phoneNumber.trim()) {
        throw new Error("전화번호를 입력해주세요.");
      }

      if (!phoneNumber.isValid) {
        throw new Error("올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)");
      }
    }
  });

  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [addingNewSchool, setAddingNewSchool] = useState(false);

  const generateGradeOptions = () => {
    const options = [];
    for (let i = 1; i <= 13; i++) {
      options.push(
        <SelectItem key={i} value={i.toString()}>
          {getGradeText(i)}
        </SelectItem>
      );
    }
    return options;
  };

  const fetchSchools = async () => {
    try {
      const schoolsData = await schoolApi.getSchools();
      setSchools(schoolsData);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      toast({
        title: "오류",
        description: "학교 목록을 불러오는데 실패했습니다",
        variant: "destructive",
      });
    }
  };

  const fetchStudent = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const student = await studentApi.getStudentDetail(parseInt(id));
      
      // useForm과 usePhoneNumberInput에 데이터 설정
      form.setValues({
        name: student.name || '',
        discordId: student.discordId || '',
        school: student.school || '',
        grade: student.grade || 1,
        status: (student.status as StudentFormData['status']) || 'ENROLLED',
        gender: (student.gender as StudentFormData['gender']) || 'MALE',
        schoolId: student.schoolId
      });
      
      phoneNumber.setValue(student.phoneNumber || '');
    } catch (error) {
      console.error('Failed to fetch student:', error);
      toast({
        title: "오류",
        description: "학생 정보를 불러오는데 실패했습니다",
        variant: "destructive",
      });
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchSchools(),
      fetchStudent()
    ]).finally(() => {
      setLoadingSchools(false);
    });
  }, [id]);

  const handleSchoolSelect = (school: SchoolType) => {
    form.setFieldValue('schoolId', school.id);
    form.setFieldValue('school', school.name);
    setSchoolOpen(false);
  };

  const handleAddNewSchool = async () => {
    const schoolName = prompt('새 학교명을 입력하세요:');
    if (!schoolName?.trim()) return;

    try {
      setAddingNewSchool(true);
      const newSchool = await schoolApi.createSchool({ name: schoolName.trim() });
      await fetchSchools();
      handleSchoolSelect(newSchool);
      
      toast({
        title: "성공",
        description: "새 학교가 추가되었습니다",
      });
    } catch (error) {
      console.error('Failed to add new school:', error);
      toast({
        title: "오류",
        description: "학교 추가에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setAddingNewSchool(false);
    }
  };

  const getGradeText = (grade: number): string => {
    if (grade >= 1 && grade <= 6) return `초등학교 ${grade}학년`;
    if (grade >= 7 && grade <= 9) return `중학교 ${grade - 6}학년`;
    if (grade >= 10 && grade <= 12) return `고등학교 ${grade - 9}학년`;
    if (grade === 13) return 'N수생';
    return `${grade}학년`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // useAsyncForm으로 제출 (검증 포함)
    const submitData = {
      ...form.values,
      phoneNumber: phoneNumber.value
    };

    try {
      await asyncForm.submit(submitData);
    } catch (error) {
      // 에러는 useAsyncForm에서 자동 처리됨
      console.error('Form submission error:', error);
    }
  };

  if (loadingSchools || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학생 정보 수정</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 이름 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  {...form.getFieldProps('name')}
                  placeholder="이름을 입력하세요"
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
                  placeholder="전화번호를 입력하세요"
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
                <Label htmlFor="discordId">디스코드 ID</Label>
                <Input
                  id="discordId"
                  {...form.getFieldProps('discordId')}
                  placeholder="디스코드 ID를 입력하세요"
                  className={form.errors.discordId ? 'border-red-500' : ''}
                />
                {form.errors.discordId && (
                  <p className="text-sm text-red-500">{form.errors.discordId}</p>
                )}
              </div>

              {/* 성별 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="gender">성별 *</Label>
                <Select 
                  value={form.values.gender}
                  onValueChange={(value) => form.setFieldValue('gender', value as StudentFormData['gender'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="성별을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">남성</SelectItem>
                    <SelectItem value="FEMALE">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 학교 필드 */}
              <div className="space-y-2">
                <Label htmlFor="school">학교</Label>
                <Popover open={schoolOpen} onOpenChange={setSchoolOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={schoolOpen}
                      className="w-full justify-between"
                    >
                      {form.values.school || "학교를 선택하세요"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="학교 검색..." />
                      <CommandEmpty>
                        <div className="p-2">
                          <p className="text-sm text-gray-500 mb-2">검색 결과가 없습니다</p>
                          <Button 
                            onClick={handleAddNewSchool}
                            disabled={addingNewSchool}
                            className="w-full text-xs"
                            variant="outline"
                          >
                            {addingNewSchool ? '추가 중...' : '새 학교 추가'}
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {schools.map((school) => (
                            <CommandItem
                              key={school.id}
                              value={school.name}
                              onSelect={() => handleSchoolSelect(school)}
                            >
                              {school.name}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  form.values.school === school.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 학년 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="grade">학년</Label>
                <Select 
                  value={form.values.grade.toString()}
                  onValueChange={(value) => form.setFieldValue('grade', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학년을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateGradeOptions()}
                  </SelectContent>
                </Select>
                {form.errors.grade && (
                  <p className="text-sm text-red-500">{form.errors.grade}</p>
                )}
              </div>

              {/* 상태 필드 - useForm 사용 */}
              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Select 
                  value={form.values.status}
                  onValueChange={(value) => form.setFieldValue('status', value as StudentFormData['status'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INQUIRY">문의</SelectItem>
                    <SelectItem value="CONSULTATION">상담예약</SelectItem>
                    <SelectItem value="ENROLLED">재원</SelectItem>
                    <SelectItem value="WAITING">대기</SelectItem>
                    <SelectItem value="WITHDRAWN">퇴원</SelectItem>
                    <SelectItem value="UNREGISTERED">미등록</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/students')}
                disabled={asyncForm.isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button 
                type="submit" 
                disabled={asyncForm.isSubmitting || !form.isValid || !phoneNumber.isValid}
              >
                {asyncForm.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEdit;
