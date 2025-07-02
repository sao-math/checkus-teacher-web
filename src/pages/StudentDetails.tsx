import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useAutoCloseSidebar } from '@/hooks/useAutoCloseSidebar';
import { Student } from '@/types/student';
import { WeeklySchedule, AssignedStudyTime, ActualStudyTime } from '@/types/schedule';
import { Activity } from '@/types/activity';
import { StudentBasicInfo } from '@/components/students/StudentBasicInfo';
import { WeeklyScheduleGrid } from '@/components/students/WeeklyScheduleGrid';
import { StudyTimeCalendar } from '@/components/students/StudyTimeCalendar';
import { TaskSidebar } from '@/components/students/TaskSidebar';
import { WeeklyScheduleDialog } from '@/components/students/WeeklyScheduleDialog';
import { studentApi } from '@/services/studentApi';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { formatKoreanTime, toUtcIsoString } from '@/utils/dateUtils';
import PageHeader from '@/components/ui/PageHeader';
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showError } = useErrorHandler();
  const [showTaskSidebar, setShowTaskSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Automatically close AppSidebar when TaskSidebar opens or screen becomes mobile
  useAutoCloseSidebar(showTaskSidebar);

  const studentId = parseInt(id || '1');
  const [student, setStudent] = useState<Student | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule[]>([]);
  const [assignedStudyTimes, setAssignedStudyTimes] = useState<AssignedStudyTime[]>([]);
  const [actualStudyTimes, setActualStudyTimes] = useState<ActualStudyTime[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WeeklySchedule | null>(null);

  // Add refs to prevent multiple concurrent fetches
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      // Prevent multiple concurrent fetches
      if (isFetchingRef.current) {
        return;
      }
      
      // Debounce rapid successive calls
      const now = Date.now();
      if (now - lastFetchTimeRef.current < 1000) {
        return;
      }
      
      isFetchingRef.current = true;
      lastFetchTimeRef.current = now;
      
      try {
        const [studentData, scheduleData, activitiesData] = await Promise.all([
          studentApi.getStudentDetail(studentId),
          studentApi.getWeeklySchedule(studentId),
          studentApi.getAllActivities()
        ]);
        
        setStudent(studentData);
        setWeeklySchedule(scheduleData);
        setActivities(activitiesData);

        // Get current month's study times
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const [assignedTimes, actualTimes] = await Promise.all([
          studentApi.getAssignedStudyTimes(
            studentId,
            toUtcIsoString(startOfMonth),
            toUtcIsoString(endOfMonth)
          ),
          studentApi.getActualStudyTimes(
            studentId,
            toUtcIsoString(startOfMonth),
            toUtcIsoString(endOfMonth)
          )
        ]);

        setAssignedStudyTimes(assignedTimes);
        setActualStudyTimes(actualTimes);
      } catch (error) {
        console.error('Error fetching student data:', error);
        showError(error, {
          title: "학생 정보 로드 실패",
          fallbackMessage: "학생 정보를 불러오는데 실패했습니다."
        });
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    // Only fetch if we have a valid studentId
    if (studentId && !isNaN(studentId)) {
      fetchData();
    }
  }, [studentId]); // Remove showError from dependencies to prevent loops

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
        title: updatedSchedule.title,
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
      showError(error, {
        title: "일정 수정 실패"
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
      showError(error, {
        title: "일정 삭제 실패"
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
        title: newSchedule.title!,
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
      showError(error, {
        title: "일정 추가 실패"
      });
    }
  };

  const handleGenerateStudyTimes = async (startDate: Date, days: number, studyTime: Partial<AssignedStudyTime>) => {
    try {
      const result = await studentApi.assignStudyTime({
        studentId: studyTime.studentId!,
        activityId: studyTime.activityId!,
        title: studyTime.title!,
        startTime: studyTime.startTime!,
        endTime: studyTime.endTime!
      });
      if (!result.success) {
        // Create an error object that includes the server message
        const error = new Error(result.message || 'Failed to assign study time.');
        (error as any).response = { data: { message: result.message } };
        throw error;
      }

      // Refresh study times data to ensure UI reflects all changes
      const now = new Date();
      const startOfPeriod = new Date(Math.min(startDate.getTime(), new Date(now.getFullYear(), now.getMonth(), 1).getTime()));
      const endOfPeriod = new Date(Math.max(
        new Date(startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000).getTime(),
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime()
      ));

      const [assignedTimes, actualTimes] = await Promise.all([
        studentApi.getAssignedStudyTimes(
          studentId,
          toUtcIsoString(startOfPeriod),
          toUtcIsoString(endOfPeriod)
        ),
        studentApi.getActualStudyTimes(
          studentId,
          toUtcIsoString(startOfPeriod),
          toUtcIsoString(endOfPeriod)
        )
      ]);
      setAssignedStudyTimes(assignedTimes);
      setActualStudyTimes(actualTimes);
    } catch (error) {
      // Re-throw the error so that the calling function (like handleCopySchedule) can handle it
      // This prevents duplicate toast messages
      throw error;
    }
  };

  const handleUpdateStudyTime = async (id: number, updates: Partial<AssignedStudyTime>) => {
    try {
      const result = await studentApi.updateStudyTime(id, {
        activityId: updates.activityId!,
        startTime: updates.startTime!,
        endTime: updates.endTime!
      });
      if (!result.success) {
        // Create an error object that includes the server message
        const error = new Error(result.message || '학습시간 수정에 실패했습니다.');
        (error as any).response = { data: { message: result.message } };
        throw error;
      }
      setAssignedStudyTimes(prev => 
        prev.map(item => 
          item.id === id ? result.data : item
        )
      );
      // Success toast removed - let child component handle it
    } catch (error) {
      // Let StudyTimeCalendar handle the error toast display
      throw error;
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
      showError(error, {
        title: "학습시간 삭제 실패"
      });
    }
  };

  // Memoize the period change handler to prevent recreation on every render
  const handlePeriodChange = useCallback(async (startDate: Date, endDate: Date) => {
    // Prevent multiple concurrent fetches
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    
    try {
      const [assignedTimes, actualTimes] = await Promise.all([
        studentApi.getAssignedStudyTimes(
          studentId,
          toUtcIsoString(startDate),
          toUtcIsoString(endDate)
        ),
        studentApi.getActualStudyTimes(
          studentId,
          toUtcIsoString(startDate),
          toUtcIsoString(endDate)
        )
      ]);
      setAssignedStudyTimes(assignedTimes);
      setActualStudyTimes(actualTimes);
    } catch (error) {
      console.error('Error fetching period data:', error);
      showError(error, {
        title: "기간 데이터 로드 실패",
        fallbackMessage: "선택한 기간의 데이터를 불러오는데 실패했습니다."
      });
    } finally {
      isFetchingRef.current = false;
    }
  }, [studentId, showError]);

  if (loading || !student) {
    return <PageLoadingSpinner text="학생 정보를 불러오는 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <PageHeader
        title={student.name}
        description={`${student.school || '학교 정보 없음'} - ${student.grade}학년`}
        onBack={handleBack}
        actions={[
          {
            label: '정보 수정',
            onClick: handleEdit,
            variant: 'outline',
            icon: <Edit className="h-4 w-4" />
          }
        ]}
        className="max-w-7xl"
      />

      {/* 메인 컨텐츠 */}
      <div className={`transition-all duration-300 ease-in-out ${
        showTaskSidebar ? 'mr-[400px] sm:mr-[540px]' : 'mr-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <StudentBasicInfo 
              student={student} 
              classes={student.classes || []} 
              guardians={student.guardians || []} 
            />

            {/* 주간 고정 일정표 */}
            <WeeklyScheduleGrid 
              weeklySchedule={weeklySchedule}
              studentId={studentId}
              onUpdateSchedule={handleUpdateSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              onAddSchedule={handleAddSchedule}
              activities={activities}
              fetchActivities={() => studentApi.getAllActivities()}
            />

            <WeeklyScheduleDialog
              open={showScheduleDialog}
              onClose={() => setShowScheduleDialog(false)}
              scheduleItem={selectedSchedule}
              onSave={handleSaveNewSchedule}
              activities={activities}
              fetchActivities={() => studentApi.getAllActivities()}
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
              activities={activities || []}
              onPeriodChange={handlePeriodChange}
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
