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
import { Student, StudentUpdateRequest } from '@/types/student';
import { studentApi } from '@/services/studentApi';
import { schoolApi, School as SchoolType } from '@/services/schoolApi';

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 전화번호 훅 사용
  const phoneNumber = usePhoneNumberInput({
    initialValue: '',
    startsWith010: true // 학생도 010으로 시작하도록 통일
  });

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    discordId: '',
    school: '',
    grade: 1,
    status: 'ENROLLED',
    gender: 'MALE',
    classes: [],
    guardians: []
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
      setFormData(student);
      // 전화번호 설정
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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSchoolSelect = (school: SchoolType) => {
    setFormData(prev => ({
      ...prev,
      schoolId: school.id,
      school: school.name
    }));
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
    
    if (!formData.name?.trim()) {
      toast({
        title: "입력 오류",
        description: "이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.value.trim()) {
      toast({
        title: "입력 오류",
        description: "전화번호를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.isValid) {
      toast({
        title: "입력 오류",
        description: "올바른 전화번호 형식을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Transform form data to match the API request format
      const updateRequest: StudentUpdateRequest = {
        name: formData.name,
        phoneNumber: phoneNumber.value.trim(),
        discordId: formData.discordId,
        profile: {
          status: formData.status,
          schoolId: formData.schoolId,
          grade: formData.grade,
          gender: formData.gender
        }
      };

      await studentApi.updateStudent(parseInt(id!), updateRequest);
      
      toast({
        title: "학생 정보 수정 완료",
        description: `${formData.name} 학생의 정보가 성공적으로 수정되었습니다.`,
      });

      navigate(`/students/${id}`);
    } catch (error) {
      console.error('Failed to update student:', error);
      toast({
        title: "수정 실패",
        description: "학생 정보 수정에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">전화번호 *</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber.value}
                  onChange={phoneNumber.onChange}
                  placeholder="전화번호를 입력하세요"
                  required
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

              <div className="space-y-2">
                <Label htmlFor="discordId">디스코드 ID</Label>
                <Input
                  id="discordId"
                  value={formData.discordId || ''}
                  onChange={(e) => handleInputChange('discordId', e.target.value)}
                  placeholder="디스코드 ID를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">성별 *</Label>
                <Select 
                  value={formData.gender || 'MALE'}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="성별을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">남성</SelectItem>
                    <SelectItem value="FEMALE">여성</SelectItem>
                    <SelectItem value="OTHER">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                      {formData.school || "학교를 선택하세요"}
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
                                  formData.school === school.name ? "opacity-100" : "opacity-0"
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

              <div className="space-y-2">
                <Label htmlFor="grade">학년</Label>
                <Select 
                  value={formData.grade?.toString() || '1'}
                  onValueChange={(value) => handleInputChange('grade', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학년을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateGradeOptions()}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Select 
                  value={formData.status || 'ENROLLED'}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INQUIRY">문의</SelectItem>
                    <SelectItem value="COUNSELING_SCHEDULED">상담예약</SelectItem>
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
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEdit;
