import React, { useState, useEffect } from 'react';
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
  Plus,
  User,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAutoCloseSidebar } from '@/hooks/useAutoCloseSidebar';
import { Student } from '@/types/student';
import { StudentBasicInfo } from '@/components/students/StudentBasicInfo';
import { StudentWeeklySchedule } from '@/components/students/StudentWeeklySchedule';
import { StudentCalendarView } from '@/components/students/StudentCalendarView';
import { TaskSidebar } from '@/components/students/TaskSidebar';
import { getGradeText } from '@/utils/gradeUtils';
import PageHeader from '@/components/ui/PageHeader';

// Mock data - 실제로는 API에서 가져와야 함
const mockStudent: Student = {
  id: 1,
  username: 'minsu123',
  name: '김민수',
  phoneNumber: '010-1234-5678',
  studentPhoneNumber: '010-1234-5678',
  discordId: 'minsu#1234',
  createdAt: '2024-01-01',
  status: 'ENROLLED',
  school: '리플랜고등학교',
  schoolId: 1,
  grade: 3,
  gender: 'MALE',
  classes: [],
  guardians: []
};

const StudentSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTaskSidebar, setShowTaskSidebar] = useState(false);

  // 실제로는 API 호출로 학생 데이터를 가져와야 함
  const student = mockStudent;

  // Automatically close AppSidebar when TaskSidebar opens or screen becomes mobile
  useAutoCloseSidebar(showTaskSidebar);

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
      <PageHeader
        title={student.name}
        description={`${getGradeText(student.grade)} · ${student.school}`}
        onBack={handleBack}
        maxWidth="max-w-7xl"
        actions={[
          {
            label: '정보 수정',
            onClick: handleEdit,
            variant: 'outline',
            icon: <Edit className="h-4 w-4" />
          },
          {
            label: '할일 추가',
            onClick: handleAddTask,
            icon: <Plus className="h-4 w-4" />
          }
        ]}
      />

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
