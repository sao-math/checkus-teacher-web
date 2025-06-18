import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Student, StudentUpdateRequest } from '@/types/student';
import { studentApi } from '@/services/studentApi';
import { schoolApi, School } from '@/services/schoolApi';
import { Save } from 'lucide-react';

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    phoneNumber: '',
    discordId: '',
    school: '',
    grade: 1,
    status: 'ENROLLED',
    gender: 'MALE',
    classes: [],
    guardians: []
  });

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Return empty string if no numbers
    if (numbers.length === 0) {
      return '';
    }
    
    // Format the number with hyphens
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const getGradeText = (grade: number) => {
    if (grade >= 1 && grade <= 6) {
      return `초등학교 ${grade}학년`;
    } else if (grade >= 7 && grade <= 9) {
      return `중학교 ${grade - 6}학년`;
    } else if (grade >= 10 && grade <= 12) {
      return `고등학교 ${grade - 9}학년`;
    } else if (grade === 13) {
      return 'N수';
    } else {
      return `${grade}학년`;
    }
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 학교 목록과 학생 정보를 병렬로 가져오기
        const [schoolsData, studentData] = await Promise.all([
          schoolApi.getSchools(),
          id ? studentApi.getStudentDetail(Number(id)) : Promise.resolve(null)
        ]);

        setSchools(schoolsData);

        if (studentData) {
          console.log('Fetched student data:', studentData);
          setFormData({
            name: studentData.name || '',
            phoneNumber: studentData.phoneNumber || '',
            discordId: studentData.discordId || '',
            school: studentData.school || '',
            schoolId: studentData.schoolId || undefined,
            grade: studentData.grade || 1,
            status: studentData.status || 'ENROLLED',
            gender: studentData.gender || 'MALE',
            classes: studentData.classes || [],
            guardians: studentData.guardians || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: "오류",
          description: "데이터를 불러오는데 실패했습니다",
          variant: "destructive",
        });
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleInputChange = (field: keyof Student, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSchoolChange = (schoolId: string) => {
    const selectedSchool = schools.find(school => school.id === Number(schoolId));
    if (selectedSchool) {
      setFormData(prev => ({
        ...prev,
        schoolId: selectedSchool.id,
        school: selectedSchool.name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Transform form data to match the API request format
      const updateRequest: StudentUpdateRequest = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        discordId: formData.discordId,
        profile: {
          status: formData.status,
          schoolId: formData.schoolId,
          grade: formData.grade,
          gender: formData.gender
        }
      };

      console.log('Sending update request:', updateRequest);
      
      await studentApi.updateStudent(Number(id), updateRequest);
      
      toast({
        title: "성공",
        description: "학생 정보가 성공적으로 수정되었습니다",
      });
      
      navigate(`/students/${id}`);
    } catch (error) {
      console.error('Failed to update student:', error);
      toast({
        title: "오류",
        description: "학생 정보 수정에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingSchools) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">학생 정보 수정</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
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
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', formatPhoneNumber(e.target.value))}
                  placeholder="전화번호를 입력하세요"
                  required
                />
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
                <Label htmlFor="school">학교 *</Label>
                <Select
                  value={formData.schoolId?.toString() || ''}
                  onValueChange={handleSchoolChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학교를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">학년 *</Label>
                <Select
                  value={formData.grade?.toString() || ''}
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
                <Label htmlFor="gender">성별 *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
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

              <div className="space-y-2">
                <Label htmlFor="status">상태 *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INQUIRY">문의</SelectItem>
                    <SelectItem value="CONSULTATION">상담</SelectItem>
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
                disabled={loading}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
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
