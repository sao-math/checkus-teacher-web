import React, { useState, useEffect } from 'react';
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
import { WeeklySchedule, AssignedStudyTime, ActualStudyTime } from '@/types/schedule';
import { Activity } from '@/types/activity';
import { StudentBasicInfo } from '@/components/students/StudentBasicInfo';
import { WeeklyScheduleGrid } from '@/components/students/WeeklyScheduleGrid';
import { StudyTimeCalendar } from '@/components/students/StudyTimeCalendar';
import { TaskSidebar } from '@/components/students/TaskSidebar';
import { WeeklyScheduleDialog } from '@/components/students/WeeklyScheduleDialog';
import { studentApi } from '@/services/studentApi';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTaskSidebar, setShowTaskSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const studentId = parseInt(id || '1');
  const [student, setStudent] = useState<Student | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule[]>([]);
  const [assignedStudyTimes, setAssignedStudyTimes] = useState<AssignedStudyTime[]>([]);
  const [actualStudyTimes, setActualStudyTimes] = useState<ActualStudyTime[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WeeklySchedule | null>(null);

  useEffect(() => {
    fetchStudentDetails();
    fetchActivities();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const [studentData, weeklyScheduleData] = await Promise.all([
        studentApi.getStudentDetail(studentId),
        studentApi.getWeeklySchedule(studentId)
      ]);
      setStudent(studentData);
      setWeeklySchedule(weeklyScheduleData);

      // Fetch study times for current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      
      const [assignedTimes, actualTimes] = await Promise.all([
        studentApi.getAssignedStudyTimes(studentId, startDate, endDate),
        studentApi.getActualStudyTimes(studentId, startDate, endDate)
      ]);
      
      setAssignedStudyTimes(assignedTimes);
      setActualStudyTimes(actualTimes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch student details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await studentApi.getActivities();
      setActivities(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate('/students');
  };

  const handleEdit = () => {
    navigate(`/students/${id}/edit`);
  };

  const handleAddTask = () => {
    setShowTaskSidebar(true);
  };

  const handleCloseTaskSidebar = () => {
    setShowTaskSidebar(false);
  };

  const handleUpdateSchedule = async (updatedSchedule: WeeklySchedule) => {
    try {
      const data = await studentApi.updateWeeklySchedule(updatedSchedule.id, {
        studentId: studentId,
        activityId: updatedSchedule.activityId,
        dayOfWeek: updatedSchedule.dayOfWeek,
        startTime: updatedSchedule.startTime,
        endTime: updatedSchedule.endTime
      });
      
      setWeeklySchedule(prev => 
        prev.map(schedule => 
          schedule.id === updatedSchedule.id ? data : schedule
        )
      );
      
      toast({
        title: "일정이 수정되었습니다.",
        description: `${updatedSchedule.activityName} 일정이 수정되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      await studentApi.deleteWeeklySchedule(scheduleId);
      setWeeklySchedule(prev => prev.filter(schedule => schedule.id !== scheduleId));
      toast({
        title: "일정이 삭제되었습니다.",
        description: "선택한 일정이 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const handleAddSchedule = () => {
    setShowScheduleDialog(true);
  };

  const handleSaveNewSchedule = async (newSchedule: Partial<WeeklySchedule>) => {
    try {
      const data = await studentApi.createWeeklySchedule({
        studentId: studentId,
        activityId: newSchedule.activityId!,
        dayOfWeek: newSchedule.dayOfWeek!,
        startTime: newSchedule.startTime!,
        endTime: newSchedule.endTime!
      });
      
      setWeeklySchedule(prev => [...prev, data]);
      toast({
        title: "일정이 추가되었습니다.",
        description: `${newSchedule.activityName} 일정이 추가되었습니다.`,
      });
      setShowScheduleDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add schedule",
        variant: "destructive",
      });
    }
  };

  const handleGenerateStudyTimes = async (startDate: Date, days: number) => {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days - 1);
      
      const [assignedTimes, actualTimes] = await Promise.all([
        studentApi.getAssignedStudyTimes(
          studentId,
          startDate.toISOString(),
          endDate.toISOString()
        ),
        studentApi.getActualStudyTimes(
          studentId,
          startDate.toISOString(),
          endDate.toISOString()
        )
      ]);
      
      setAssignedStudyTimes(assignedTimes);
      setActualStudyTimes(actualTimes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate study times",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStudyTime = async (id: number, updates: Partial<AssignedStudyTime>) => {
    try {
      const data = await studentApi.updateStudyTime(id, {
        activityId: updates.activityId!,
        startTime: updates.startTime!,
        endTime: updates.endTime!
      });
      
      setAssignedStudyTimes(prev => 
        prev.map(item => 
          item.id === id ? data : item
        )
      );
      
      toast({
        title: "학습시간이 수정되었습니다.",
        description: "선택한 학습시간이 수정되었습니다.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update study time",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudyTime = async (id: number) => {
    try {
      await studentApi.deleteStudyTime(id);
      setAssignedStudyTimes(prev => prev.filter(item => item.id !== id));
      toast({
        title: "학습시간이 삭제되었습니다.",
        description: "선택한 학습시간이 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete study time",
        variant: "destructive",
      });
    }
  };

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
                  {student.grade}학년 · {student.school}
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
              activities={activities}
              fetchActivities={fetchActivities}
            />

            <WeeklyScheduleDialog
              open={showScheduleDialog}
              onClose={() => setShowScheduleDialog(false)}
              scheduleItem={selectedSchedule}
              onSave={handleSaveNewSchedule}
              activities={activities}
              fetchActivities={fetchActivities}
            />

            {/* 학습시간 달력 (주간 또는 월간) */}
            <StudyTimeCalendar
              studentId={student?.id || 0}
              assignedStudyTimes={assignedStudyTimes}
              actualStudyTimes={actualStudyTimes}
              setAssignedStudyTimes={setAssignedStudyTimes}
              weeklySchedule={weeklySchedule}
              onUpdateStudyTime={handleUpdateStudyTime}
              onDeleteStudyTime={handleDeleteStudyTime}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onGenerateStudyTimes={handleGenerateStudyTimes}
              onAddTask={handleAddTask}
            />
          </div>
        </div>
      </div>

      {/* 태스크 사이드바 */}
      <TaskSidebar
        open={showTaskSidebar}
        onClose={handleCloseTaskSidebar}
        studentId={studentId}
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
