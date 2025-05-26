import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student, School } from '@/types/student';

// Mock schools data - 실제로는 API에서 가져와야 함
const mockSchools: School[] = [
  { id: 1, name: '리플랜고등학교' },
  { id: 2, name: '사오중학교' },
  { id: 3, name: '한국고등학교' },
  { id: 4, name: '서울중학교' },
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

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSave: (student: any) => void;
}

export const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  open,
  onOpenChange,
  student,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phoneNumber: '',
    discordId: '',
    grade: 7,
    schoolId: 0,
    gender: 'male' as 'male' | 'female',
    status: '문의' as '문의' | '상담예약' | '재원' | '대기' | '퇴원' | '미등록',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        username: student.username,
        name: student.name,
        phoneNumber: student.phoneNumber,
        discordId: student.discordId || '',
        grade: student.grade,
        schoolId: student.schoolId,
        gender: student.gender,
        status: student.status,
      });
    } else {
      setFormData({
        username: '',
        name: '',
        phoneNumber: '',
        discordId: '',
        grade: 7,
        schoolId: 0,
        gender: 'male',
        status: '문의',
      });
    }
  }, [student, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const schoolName = mockSchools.find(s => s.id === formData.schoolId)?.name || '';
    
    onSave({
      ...formData,
      ...(student && { id: student.id }),
      schoolName,
    });
    onOpenChange(false);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {student ? '학생 정보 수정' : '새 학생 등록'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">사용자명 *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="영문, 숫자 조합"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="학생 이름"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">전화번호 *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="010-1234-5678"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discordId">Discord ID</Label>
              <Input
                id="discordId"
                value={formData.discordId}
                onChange={(e) => handleChange('discordId', e.target.value)}
                placeholder="username#1234"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schoolId">학교 *</Label>
              <Select value={formData.schoolId.toString()} onValueChange={(value) => handleChange('schoolId', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="학교 선택" />
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
            
            <div className="space-y-2">
              <Label htmlFor="grade">학년 *</Label>
              <Select value={formData.grade.toString()} onValueChange={(value) => handleChange('grade', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="학년 선택" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">성별 *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="성별 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
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

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {student ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
