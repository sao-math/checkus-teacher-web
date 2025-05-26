import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Student } from '@/types/student';

// Mock students data - 실제로는 API에서 가져와야 함
const mockStudents: Student[] = [
  {
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
    completionRate: 85
  },
  {
    id: 2,
    username: 'jiwon456',
    name: '박지원',
    phoneNumber: '010-2345-6789',
    discordId: 'jiwon#5678',
    createdAt: '2024-01-01',
    status: '상담예약',
    schoolId: 2,
    schoolName: '사오중학교',
    grade: 2,
    gender: 'female',
    completionRate: 92
  },
  {
    id: 3,
    username: 'soyoung789',
    name: '이소영',
    phoneNumber: '010-3456-7890',
    createdAt: '2024-01-01',
    status: '문의',
    schoolId: 1,
    schoolName: '리플랜고등학교',
    grade: 1,
    gender: 'female',
    completionRate: 78
  },
  {
    id: 4,
    username: 'hyunwoo012',
    name: '최현우',
    phoneNumber: '010-4567-8901',
    createdAt: '2024-01-01',
    status: '대기',
    schoolId: 1,
    schoolName: '리플랜고등학교',
    grade: 3,
    gender: 'male',
    completionRate: 45
  }
];

interface AddStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStudents: (studentIds: number[]) => void;
}

export const AddStudentsDialog: React.FC<AddStudentsDialogProps> = ({
  open,
  onOpenChange,
  onAddStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAdd = () => {
    onAddStudents(selectedStudents);
    setSelectedStudents([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>학생 추가</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="학생 이름, 사용자명, 학교로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={`student-${student.id}`}
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => handleStudentSelect(student.id)}
                />
                <label
                  htmlFor={`student-${student.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-500">
                    {student.grade}학년 · {student.schoolName}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedStudents.length === 0}
          >
            {selectedStudents.length}명 추가하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 