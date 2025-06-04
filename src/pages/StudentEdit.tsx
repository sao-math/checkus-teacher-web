import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/student';
import { studentApi } from '@/services/studentApi';
import { Save } from 'lucide-react';

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    studentPhoneNumber: '',
    school: '',
    grade: 1,
    status: 'ENROLLED',
    classes: [],
    guardians: []
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await studentApi.getStudentDetail(Number(id));
        setFormData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch student details",
          variant: "destructive",
        });
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id, toast]);

  const handleInputChange = (field: keyof Student, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (data: Partial<Student>) => {
    try {
      await studentApi.updateStudent(Number(id), data);
      toast({
        title: "Success",
        description: "Student information updated successfully",
      });
      navigate(`/students/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student information",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학생 정보 수정</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">전화번호 *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.studentPhoneNumber}
                  onChange={(e) => handleInputChange('studentPhoneNumber', e.target.value)}
                  placeholder="전화번호를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">학교 *</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  placeholder="학교를 입력하세요"
                />
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
                    <SelectItem value="1">1학년</SelectItem>
                    <SelectItem value="2">2학년</SelectItem>
                    <SelectItem value="3">3학년</SelectItem>
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
                    <SelectItem value="ENROLLED">재원</SelectItem>
                    <SelectItem value="GRADUATED">졸업</SelectItem>
                    <SelectItem value="WITHDRAWN">퇴원</SelectItem>
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
                취소
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(formData)}
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
              >
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEdit;
