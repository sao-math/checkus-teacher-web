import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

interface Teacher {
  id: number;
  username: string;
  name: string;
  phoneNumber: string;
  discordId?: string;
  createdAt: string;
  status: 'active' | 'pending' | 'resigned';
  classes: string[];
}

const mockTeachers: Teacher[] = [
  {
    id: 1,
    username: 'teacher1',
    name: '김선생님',
    phoneNumber: '010-1234-5678',
    discordId: 'teacher1#1234',
    createdAt: '2024-01-01',
    status: 'active',
    classes: ['고1 수학', '고2 수학']
  },
  {
    id: 2,
    username: 'teacher2',
    name: '이선생님',
    phoneNumber: '010-2345-6789',
    discordId: 'teacher2#5678',
    createdAt: '2024-01-02',
    status: 'active',
    classes: ['중2 수학', '중3 수학']
  }
];

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phoneNumber: '',
    discordId: '',
    status: 'active' as 'active' | 'pending' | 'resigned'
  });

  useEffect(() => {
    if (isEdit && id) {
      const existingTeacher = mockTeachers.find(t => t.id === parseInt(id));
      if (existingTeacher) {
        setFormData({
          username: existingTeacher.username,
          name: existingTeacher.name,
          phoneNumber: existingTeacher.phoneNumber,
          discordId: existingTeacher.discordId || '',
          status: existingTeacher.status
        });
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "입력 오류",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phoneNumber.trim()) {
      toast({
        title: "입력 오류",
        description: "전화번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // 실제로는 API 호출을 할 것입니다
    toast({
      title: isEdit ? "선생님 정보 수정 완료" : "선생님 등록 완료",
      description: `${formData.name} 선생님의 정보가 성공적으로 ${isEdit ? '수정' : '등록'}되었습니다.`,
    });

    navigate('/teachers');
  };

  const handleDelete = () => {
    // 실제로는 API 호출을 할 것입니다
    toast({
      title: "선생님 삭제",
      description: `${formData.name} 선생님이 삭제되었습니다.`,
      variant: "destructive",
    });

    navigate('/teachers');
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/teachers')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEdit ? '선생님 정보 수정' : '새 선생님 등록'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? `${formData.name} 선생님의 정보를 수정합니다` : '새로운 선생님을 등록합니다'}
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
                        {formData.name} 선생님의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-5 w-5" />
              선생님 기본 정보
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
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="사용자명을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="이름을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">전화번호 *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      placeholder="전화번호를 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discordId">Discord ID</Label>
                    <Input
                      id="discordId"
                      value={formData.discordId}
                      onChange={(e) => handleChange('discordId', e.target.value)}
                      placeholder="Discord ID를 입력하세요"
                    />
                  </div>
                </div>
              </div>

              {/* 상태 정보 */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">상태 정보</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">상태 *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="상태를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">재직중</SelectItem>
                        <SelectItem value="pending">승인대기</SelectItem>
                        <SelectItem value="resigned">퇴직</SelectItem>
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

export default TeacherForm; 