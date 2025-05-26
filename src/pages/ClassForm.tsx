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

const ClassForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    maxStudents: '',
    schedule: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    if (isEdit && id) {
      const existingClass = mockClasses.find(cls => cls.id === parseInt(id));
      if (existingClass) {
        const teacher = mockTeachers.find(t => t.name === existingClass.teacher);
        setFormData({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "입력 오류",
        description: "반 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.teacherId) {
      toast({
        title: "입력 오류",
        description: "담당 선생님을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: isEdit ? "반 정보 수정 완료" : "반 등록 완료",
      description: `${formData.name}의 정보가 성공적으로 ${isEdit ? '수정' : '등록'}되었습니다.`,
    });

    navigate('/classes');
  };

  const handleDelete = () => {
    toast({
      title: "반 삭제",
      description: `${formData.name}이(가) 삭제되었습니다.`,
      variant: "destructive",
    });

    navigate('/classes');
  };

  const handleChange = (field: string, value: string) => {
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/classes')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEdit ? '반 정보 수정' : '새 반 등록'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? `${formData.name}의 정보를 수정합니다` : '새로운 반을 등록합니다'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEdit && (
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
                        {formData.name}의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
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
              <Button onClick={handleSubmit} className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800">
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <div>
                  <Label htmlFor="name">반 이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="반 이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="teacher">담당 선생님 *</Label>
                  <Select value={formData.teacherId} onValueChange={(value) => handleChange('teacherId', value)}>
                    <SelectTrigger>
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
                </div>
                <div>
                  <Label htmlFor="maxStudents">최대 학생 수</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => handleChange('maxStudents', e.target.value)}
                    placeholder="최대 학생 수를 입력하세요"
                  />
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
                <div>
                  <Label htmlFor="schedule">수업 일정</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="schedule"
                      value={formData.schedule}
                      onChange={(e) => handleChange('schedule', e.target.value)}
                      placeholder="수업 일정을 입력하세요"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="반에 대한 설명을 입력하세요"
                    className="h-24"
                  />
                </div>
                <div>
                  <Label htmlFor="status">상태 *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
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
      </div>
    </div>
  );
};

export default ClassForm;
