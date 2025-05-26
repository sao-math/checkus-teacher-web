import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Edit,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/student';
import { WeeklySchedule, AssignedStudyTime } from '@/types/schedule';
import { Activity } from '@/types/activity';
import { StudentBasicInfo } from '@/components/students/StudentBasicInfo';
import { WeeklyScheduleGrid } from '@/components/students/WeeklyScheduleGrid';
import { StudyTimeCalendar } from '@/components/students/StudyTimeCalendar';
import { TaskSidebar } from '@/components/students/TaskSidebar';
import { WeeklyScheduleDialog } from '@/components/students/WeeklyScheduleDialog';

// Mock data - 실제로는 API에서 가져와야 함
const mockStudent: Student = {
  id: 1,
  username: 'minsu123',
  name: '김민수',
  phoneNumber: '010-1234-5678',
  discordId: 'minsu#1234',
  createdAt: '2024-01-01',
  status: '문의',
  schoolId: 1,
  schoolName: '리플랜고등학교',
  grade: 3,
  gender: 'male',
  completionRate: 0,
  lastActivity: new Date().toISOString()
};

const mockActivities: Activity[] = [
  { id: 1, name: '사오수학', type: '학원', isStudyAssignable: false },
  { id: 2, name: '영어학원', type: '학원', isStudyAssignable: false },
  { id: 3, name: '사오숙제', type: '자습', isStudyAssignable: true },
  { id: 4, name: '자습시간', type: '자습', isStudyAssignable: true },
];

const mockWeeklySchedule: WeeklySchedule[] = [
  {
    id: 1,
    studentId: 1,
    activityId: 1,
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '12:00',
    activity: mockActivities[0]
  },
  {
    id: 2,
    studentId: 1,
    activityId: 2,
    dayOfWeek: 1,
    startTime: '13:00',
    endTime: '15:00',
    activity: mockActivities[1]
  },
  {
    id: 3,
    studentId: 1,
    activityId: 3,
    dayOfWeek: 1,
    startTime: '12:00',
    endTime: '13:00',
    activity: mockActivities[2]
  },
  {
    id: 4,
    studentId: 1,
    activityId: 4,
    dayOfWeek: 3,
    startTime: '10:00',
    endTime: '12:00',
    activity: mockActivities[3]
  },
  {
    id: 5,
    studentId: 1,
    activityId: 1,
    dayOfWeek: 2,
    startTime: '14:00',
    endTime: '16:00',
    activity: mockActivities[0]
  },
  {
    id: 6,
    studentId: 1,
    activityId: 4,
    dayOfWeek: 5,
    startTime: '09:00',
    endTime: '11:00',
    activity: mockActivities[3]
  },
];

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTaskSidebar, setShowTaskSidebar] = useState(false);
  
  const studentId = parseInt(id || '1');
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule[]>(mockWeeklySchedule);
  const [assignedStudyTimes, setAssignedStudyTimes] = useState<AssignedStudyTime[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

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

  const handleUpdateSchedule = (updatedSchedule: WeeklySchedule) => {
    setWeeklySchedule(prev => 
      prev.map(schedule => 
        schedule.id === updatedSchedule.id ? updatedSchedule : schedule
      )
    );
    toast({
      title: "일정이 수정되었습니다.",
      description: `${updatedSchedule.activity?.name} 일정이 수정되었습니다.`,
    });
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    setWeeklySchedule(prev => prev.filter(schedule => schedule.id !== scheduleId));
    toast({
      title: "일정이 삭제되었습니다.",
      description: "선택한 일정이 삭제되었습니다.",
    });
  };

  const handleAddSchedule = () => {
    setShowScheduleDialog(true);
  };

  const handleSaveNewSchedule = (newSchedule: Partial<WeeklySchedule>) => {
    setWeeklySchedule(prev => [...prev, newSchedule as WeeklySchedule]);
    toast({
      title: "일정이 추가되었습니다.",
      description: `${newSchedule.activity?.name} 일정이 추가되었습니다.`,
    });
    setShowScheduleDialog(false);
  };

  const handleGenerateStudyTimes = async (startDate: Date, days: number) => {
    console.log('Generate study times:', { startDate, days, studentId });
    
    // TODO: 실제 API 호출로 대체
    // 시뮬레이션: 2초 후 완료
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock data for demonstration
    const mockAssignedTimes: AssignedStudyTime[] = [
      {
        id: 1,
        studentId,
        activityId: 1,
        startTime: new Date(startDate.getTime() + 9 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(startDate.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        assignedBy: 1,
        activity: mockActivities[0]
      },
      {
        id: 2,
        studentId,
        activityId: 2,
        startTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(),
        assignedBy: 1,
        activity: mockActivities[1]
      }
    ];
    
    setAssignedStudyTimes(mockAssignedTimes);
  };

  // 학습시간 업데이트 핸들러
  const handleUpdateStudyTime = (id: number, updates: Partial<AssignedStudyTime>) => {
    setAssignedStudyTimes(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  // 학습시간 삭제 핸들러
  const handleDeleteStudyTime = (id: number) => {
    setAssignedStudyTimes(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className={`bg-white border-b sticky top-0 z-10 transition-all duration-300 ease-in-out`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
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
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className={`transition-all duration-300 ease-in-out ${
        showTaskSidebar ? 'mr-[400px] sm:mr-[540px]' : 'mr-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <StudentBasicInfo student={student} />

            {/* 주간 고정 일정표 */}
            <WeeklyScheduleGrid 
              weeklySchedule={weeklySchedule}
              studentId={studentId}
              onUpdateSchedule={handleUpdateSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              onAddSchedule={handleAddSchedule}
            />

            <WeeklyScheduleDialog
              open={showScheduleDialog}
              onClose={() => setShowScheduleDialog(false)}
              onSave={handleSaveNewSchedule}
            />

            {/* 학습시간 달력 (주간 또는 월간) */}
            {viewMode === 'week' ? (
              <StudyTimeCalendar
                studentId={studentId}
                assignedStudyTimes={assignedStudyTimes}
                setAssignedStudyTimes={setAssignedStudyTimes}
                weeklySchedule={weeklySchedule}
                onUpdateStudyTime={handleUpdateStudyTime}
                onDeleteStudyTime={handleDeleteStudyTime}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onGenerateStudyTimes={handleGenerateStudyTimes}
                onAddTask={handleAddTask}
              />
            ) : (
              <StudyTimeCalendar
                studentId={studentId}
                assignedStudyTimes={assignedStudyTimes}
                setAssignedStudyTimes={setAssignedStudyTimes}
                weeklySchedule={weeklySchedule}
                onUpdateStudyTime={handleUpdateStudyTime}
                onDeleteStudyTime={handleDeleteStudyTime}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onGenerateStudyTimes={handleGenerateStudyTimes}
                onAddTask={handleAddTask}
              />
            )}
          </div>
        </div>
      </div>

      {/* 할일 추가 사이드바 */}
      <TaskSidebar 
        open={showTaskSidebar}
        onClose={() => setShowTaskSidebar(false)}
        studentId={student.id}
        onTaskDragStart={(task, event) => {
          const dragData = {
            type: 'task',
            task
          };
          event.dataTransfer.setData('application/json', JSON.stringify(dragData));
        }}
      />
    </div>
  );
};

export default StudentDetails;
