
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Users, 
  Phone, 
  Mail, 
  Edit, 
  Calendar,
  Clock,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/student';
import { StudentBasicInfo } from '@/components/students/StudentBasicInfo';
import { StudentWeeklySchedule } from '@/components/students/StudentWeeklySchedule';
import { StudentCalendarView } from '@/components/students/StudentCalendarView';
import { TaskSidebar } from '@/components/students/TaskSidebar';

// Mock data - 실제로는 API에서 가져와야 함
const mockStudent: Student = {
  id: 1,
  username: 'minsu123',
  name: '김민수',
  phoneNumber: '010-1234-5678',
  discordId: 'minsu#1234',
  createdAt: '2024-01-01',
  status: 'active',
  schoolId: 1,
  schoolName: '리플랜고등학교',
  grade: 3,
  gender: 'male',
  completionRate: 85,
  lastActivity: '2024-01-24'
};

const StudentSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTaskSidebar, setShowTaskSidebar] = useState(false);

  // 실제로는 API 호출로 학생 데이터를 가져와야 함
  const student = mockStudent;

  const handleBack = () => {
    navigate('/students');
  };

  const handleEdit = () => {
    navigate(`/students/${id}/edit`);
  };

  const handleAddTask = () => {
    setShowTaskSidebar(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{student.name}</h1>
                <p className="text-sm text-gray-500">
                  {student.grade}학년 · {student.schoolName}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                정보 수정
              </Button>
              <Button onClick={handleAddTask}>
                <Plus className="h-4 w-4 mr-2" />
                할일 추가
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* 상단: 학생 기본 정보 섹션 */}
          <StudentBasicInfo student={student} />

          {/* 중간: 고정 시간표 섹션 */}
          <StudentWeeklySchedule studentId={student.id} />

          {/* 하단: 학생별 공부시간/할일 달력뷰 섹션 */}
          <StudentCalendarView studentId={student.id} />
        </div>
      </div>

      {/* 할일 추가 사이드바 */}
      <TaskSidebar 
        open={showTaskSidebar}
        onClose={() => setShowTaskSidebar(false)}
        studentId={student.id}
      />
    </div>
  );
};

export default StudentSchedule;
