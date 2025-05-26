import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/student';
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

// Mock data - 실제로는 API에서 가져와야 함
const mockStudent: Student = {
  id: 1,
  username: 'minsu123',
  name: '김민수',
  phoneNumber: '010-1234-5678',
  discordId: 'minsu#1234',
  createdAt: '2024-01-01',
  status: '재원',
  schoolId: 1,
  schoolName: '리플랜고등학교',
  grade: 3,
  gender: 'male',
  completionRate: 85,
  lastActivity: '2024-01-24'
};

const mockSchools = [
  { id: 1, name: '리플랜고등학교' },
  { id: 2, name: '서울고등학교' },
  { id: 3, name: '부산고등학교' },
];

const gradeOptions = [
  { value: '7', label: '중1' },
  { value: '8', label: '중2' },
  { value: '9', label: '중3' },
  { value: '10', label: '고1' },
  { value: '11', label: '고2' },
  { value: '12', label: '고3' },
  { value: '13', label: 'N수' },
];

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: mockStudent.username,
    name: mockStudent.name,
    phoneNumber: mockStudent.phoneNumber,
    discordId: mockStudent.discordId || '',
    status: mockStudent.status,
    schoolId: mockStudent.schoolId,
    grade: mockStudent.grade,
    gender: mockStudent.gender,
  });

  const handleBack = () => {
    navigate('/students');
  };

  const handleSave = () => {
    // 실제로는 API 호출로 학생 정보를 업데이트해야 함
    console.log('Updating student:', formData);
    
    toast({
      title: "성공",
      description: "학생 정보가 수정되었습니다.",
    });

    navigate(`/students/${id}/schedule`);
  };

  const handleDelete = () => {
    // 실제로는 API 호출로 학생을 삭제해야 함
    console.log('Deleting student:', id);
    
    toast({
      title: "학생 삭제",
      description: `${formData.name} 학생이 삭제되었습니다.`,
      variant: "destructive",
    });

    navigate('/students');
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
                <h1 className="text-xl font-semibold text-gray-900">학생 정보 수정</h1>
                <p className="text-sm text-gray-500">
                  {formData.name}의 정보를 수정합니다
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800">
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {formData.name} 학생의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
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
              <Button onClick={handleSave} className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800">
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-5 w-5" />
              학생 기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">기본 정보</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">사용자명 *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="사용자명을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">전화번호</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="전화번호를 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discordId">Discord ID</Label>
                    <Input
                      id="discordId"
                      value={formData.discordId}
                      onChange={(e) => handleInputChange('discordId', e.target.value)}
                      placeholder="Discord ID를 입력하세요"
                    />
                  </div>
                </div>
              </div>

              {/* 학교 정보 */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">학교 정보</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="school">학교 *</Label>
                    <Select
                      value={formData.schoolId.toString()}
                      onValueChange={(value) => handleInputChange('schoolId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="학교를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSchools.map((school) => (
                          <SelectItem key={school.id} value={school.id.toString()}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grade">학년 *</Label>
                    <Select
                      value={formData.grade.toString()}
                      onValueChange={(value) => handleInputChange('grade', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="학년을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gender">성별</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="성별을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">남성</SelectItem>
                        <SelectItem value="female">여성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">상태</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="상태를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="문의">문의</SelectItem>
                        <SelectItem value="상담예약">상담예약</SelectItem>
                        <SelectItem value="재원">재원</SelectItem>
                        <SelectItem value="대기">대기</SelectItem>
                        <SelectItem value="퇴원">퇴원</SelectItem>
                        <SelectItem value="미등록">미등록</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentEdit;
